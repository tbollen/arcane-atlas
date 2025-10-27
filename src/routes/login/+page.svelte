<script lang="ts">
	// Client stuff
	import { onMount } from 'svelte';
	import { authClient } from '$lib/utils/auth/auth-client';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';

	// UI Components
	import Icon from '@iconify/svelte';
	import Divider from '$lib/components/ui/divider/Divider.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card/';
	import * as Form from '$lib/components/ui/form/';
	import * as Password from '$lib/components/ui/password/';
	import { toast } from 'svelte-sonner';

	// Superform stuff
	import {
		loginFormSchema,
		registerFormSchema,
		forgotPasswordSchema,
		tokenSchema
	} from './formSchema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { spinner } from '$lib/stores/loadingSpinner.svelte';

	// Get url params
	import { page } from '$app/stores';
	import { form } from '$app/server';
	let params = $derived($page.url.searchParams);

	// LOAD from server
	let { data } = $props();

	///////////////////////////
	// SUPERFORM FORMS STUFF //
	///////////////////////////
	// REGISTER
	const form_register = superForm(data.registerForm, {
		validators: zod4Client(registerFormSchema),
		resetForm: true,
		delayMs: 500,
		timeoutMs: 8000
	});
	const {
		form: registerForm,
		errors: registerErrors,
		enhance: registerEnhance,
		message: registerMessage,
		delayed: registerDelayed,
		submitting: registerSubmitting
	} = form_register;

	// LOGIN
	const form_login = superForm(data.loginForm, {
		validators: zod4Client(loginFormSchema),
		resetForm: true,
		delayMs: 500,
		timeoutMs: 8000
	});
	const {
		form: loginForm,
		errors: loginErrors,
		enhance: loginEnhance,
		message: loginMessage,
		delayed: loginDelayed,
		submitting: loginSubmitting
	} = form_login;

	// FORGOT
	const form_forgot = superForm(data.forgotPasswordForm, {
		validators: zod4Client(forgotPasswordSchema),
		delayMs: 500,
		timeoutMs: 8000
	});
	const {
		form: forgotForm,
		errors: forgotErrors,
		enhance: forgotEnhance,
		message: forgotMessage,
		delayed: forgotDelayed,
		submitting: forgotSubmitting
	} = form_forgot;

	// TOKEN (for reset after token has been set)
	const form_token = superForm(data.tokenForm, {
		validators: zod4Client(tokenSchema),
		delayMs: 500,
		timeoutMs: 8000
	});
	const {
		form: tokenForm,
		errors: tokenErrors,
		enhance: tokenEnhance,
		message: tokenMessage,
		delayed: tokenDelayed,
		submitting: tokenSubmitting
	} = form_token;

	// TOAST ON REGISTER
	$effect(() => {
		const msg = $forgotMessage;
		if (msg?.type === 'error') toast.error(msg.message, { duration: 5000 });
		else if (msg?.type === 'success') toast.success(msg.message, { duration: 5000 });
		else if (msg?.message) {
			toast.info(msg.message, { duration: 5000 });
		}
	});

	// STUFF WHEN TOKEN RESET
	$effect(() => {
		const msg = $tokenMessage;
		if (msg?.reset === true) setPage('login');
		if (msg?.type === 'error') toast.error(msg.message, { duration: 5000 });
		else if (msg?.type === 'success') toast.success(msg.message, { duration: 5000 });
		else if (msg?.message) {
			toast.info(msg.message, { duration: 5000 });
		}
	});

	///////////////////////
	// END OF FORM STUFF //
	///////////////////////

	// Page param for registering / logging in
	function setFormPage(params: URLSearchParams): 'login' | 'register' | 'forgot' | 'reset' {
		const register = params.get('register');
		const forgot = params.get('forgot');
		const reset = params.get('token');
		if (reset) return 'reset';
		else if (forgot !== null) return 'forgot';
		else if (register !== null) return 'register';
		else return 'login';
	}

	function setPage(page: 'login' | 'register' | 'forgot' | 'reset') {
		switch (page) {
			case 'login':
				params.delete('register');
				params.delete('forgot');
				params.delete('token');
				break;
			case 'register':
				params.set('register', '');
				params.delete('forgot');
				params.delete('token');
				break;
			case 'forgot':
				params.set('forgot', '');
				params.delete('register');
				params.delete('token');
				break;
			case 'reset':
				params.delete('register');
				params.delete('forgot');
				// Do nothing, token should stay
				break;
		}
		const queryString = params.toString();
		const newUrl = queryString ? `/login?${queryString}` : '/login';
		history.replaceState(null, '', newUrl);
		formPage = page;
	}
	let formPage = $state(setFormPage($page.url.searchParams));
	// State for social provider
	type validProviders = 'github' | 'discord'; //TODO: dynamically get

	let session: any;

	onMount(async () => {
		session = await authClient.getSession();
		if (session && session?.data?.user) goto(`${base}/account`);

		// SYNC Token
		if (params.get('token')) {
			console.log('Setting token from URL param');
			$tokenForm.token = params.get('token')?.toString() || 'ERROR';
		}
	});
</script>

<main>
	<!-- {#if formResponse?.message}
		<p>{formResponse?.success ? 'Success' : 'Error'}: {formResponse?.message}</p>
	{/if} -->
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			{#if formPage === 'register'}
				<Card.Title>Register a new account</Card.Title>
				<Card.Description>Enter your email below to register a new account</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => setPage('login')}>Login</Button>
				</Card.Action>
			{:else if formPage === 'forgot'}
				<Card.Title>Forgot your password?</Card.Title>
				<Card.Description>Enter your email below to reset your password</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => setPage('login')}>Login</Button>
				</Card.Action>
			{:else if formPage === 'reset'}
				<Card.Title>Reset your password</Card.Title>
				<Card.Description>Enter your new password below to reset your password</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => setPage('login')}>Login</Button>
				</Card.Action>
			{:else}
				<Card.Title>Login to your account</Card.Title>
				<Card.Description>Enter your email below to login to your account</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => setPage('register')}>Register</Button>
				</Card.Action>
			{/if}
		</Card.Header>
		<Card.Content>
			{#if formPage === 'register'}
				<!-- REGISTER -->
				<!-- svelte-ignore component_name_lowercase -->
				<form method="POST" class="!p-0" action="?/register" use:registerEnhance>
					<!-- Username -->
					<Form.Field form={form_register} name="displayName" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Username</Form.Label>
								<Input {...props} bind:value={$registerForm.displayName} autocomplete="nickname" />
							{/snippet}
						</Form.Control>
						<Form.Description
							>This is your <u class="font-medium underline">public</u> display name.</Form.Description
						>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Email -->
					<Form.Field form={form_register} name="email" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Input {...props} bind:value={$registerForm.email} autocomplete="email" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Password -->
					<Form.Field form={form_register} name="password" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<Password.Root>
									<Password.Input
										bind:value={$registerForm.password}
										{...props}
										autocomplete="new-password"
									>
										<Password.ToggleVisibility />
									</Password.Input>
									<Password.Strength />
								</Password.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Confirm Password -->
					<Form.Field form={form_register} name="confirmPassword" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Confirm Password</Form.Label>
								<Input {...props} type="password" bind:value={$registerForm.confirmPassword} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Terms and Conditions -->
					<Form.Field form={form_register} name="acceptTerms" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Checkbox {...props} bind:checked={$registerForm.acceptTerms} />
									<Form.Label class="font-normal">
										I agree to the<a
											class="underline"
											href="https://github.com/tbollen/arcane-rift-companion/blob/main/static/legal/terms-and-conditions.md"
											target="_blank"
											rel="noopener noreferrer">terms and conditions</a
										>
									</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Privacy Policy -->
					<Form.Field form={form_register} name="acceptPrivacyPolicy" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Checkbox {...props} bind:checked={$registerForm.acceptPrivacyPolicy} />
									<Form.Label class="font-normal"
										>I agree to the <a
											class="underline"
											href="https://github.com/tbollen/arcane-rift-companion/blob/main/static/legal/privacy-policy.md"
											target="_blank"
											rel="noopener noreferrer">privacy policy</a
										></Form.Label
									>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Submit -->
					<Form.Button
						type="submit"
						variant="bold"
						disabled={$registerSubmitting ||
							!$registerForm.acceptTerms ||
							!$registerForm.acceptPrivacyPolicy}
						class="w-full"
					>
						{#if $registerSubmitting}
							<Spinner />
						{:else}Register{/if}
					</Form.Button>
				</form>
			{:else if formPage === 'forgot'}
				<!-- FORGOT PASSWORD -->
				<!-- svelte-ignore component_name_lowercase -->
				<form method="POST" class="!p-0" action="?/forgot" use:forgotEnhance>
					<!-- Email -->
					<Form.Field form={form_forgot} name="email" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Input {...props} bind:value={$forgotForm.email} autocomplete="email" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={form_forgot} name="confirm" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Checkbox {...props} bind:checked={$forgotForm.confirm} />
									<Form.Label>Confirm reset</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Submit -->
					<Button type="submit" disabled={$forgotSubmitting} variant="bold" class="w-full">
						{#if $forgotSubmitting}
							<Spinner />
						{:else}
							Reset Password
						{/if}
					</Button>
				</form>
			{:else if formPage === 'reset'}
				<!-- RESET PASSWORD -->
				<!-- svelte-ignore component_name_lowercase -->
				<form class="!p-0" action="?/reset" method="POST" use:tokenEnhance>
					<!-- Token (readonly) -->
					<Form.Field form={form_token} name="token" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Reset Token</Form.Label>
								<p class="text-xs text-muted-foreground">
									*The reset token is automatically retrieved from the URL
								</p>
								<Input {...props} type="text" bind:value={$tokenForm.token} />
							{/snippet}
						</Form.Control>

						<Form.FieldErrors />
					</Form.Field>
					<!-- New Password -->
					<Form.Field form={form_token} name="newPassword" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>New Password</Form.Label>
								<Password.Root class="w-full">
									<Password.Input
										bind:value={$tokenForm.newPassword}
										{...props}
										id="newPassword"
										autocomplete="new-password"
									>
										<Password.ToggleVisibility />
									</Password.Input>
									<Password.Strength />
								</Password.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Confirm Password -->
					<Form.Field form={form_token} name="confirmPassword" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Confirm New Password</Form.Label>
								<Password.Root class="w-full">
									<Password.Input
										bind:value={$tokenForm.confirmPassword}
										{...props}
										id="confirmPassword"
										autocomplete="new-password"
									>
										<Password.ToggleVisibility />
									</Password.Input>
								</Password.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Submit -->
					<Form.Button type="submit" disabled={$tokenSubmitting} variant="bold" class="w-full">
						{#if $tokenSubmitting}
							<Spinner />
						{:else}Set new password{/if}
					</Form.Button>
				</form>
			{:else}
				<!-- LOGIN -->
				<!-- svelte-ignore component_name_lowercase -->
				<form method="POST" class="!p-0" action="?/login" use:loginEnhance>
					<!-- Email -->
					<Form.Field form={form_login} name="email" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Input {...props} bind:value={$loginForm.email} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Password -->
					<Form.Field form={form_login} name="password" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<Password.Root>
									<Password.Input
										bind:value={$loginForm.password}
										{...props}
										autocomplete="current-password"
									>
										<Password.ToggleVisibility />
									</Password.Input>
								</Password.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<div class="flex w-full flex-row items-center justify-between">
						<!-- Remember Me -->
						<Form.Field form={form_login} name="rememberMe" class="w-full">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center gap-2">
										<Checkbox {...props} bind:checked={$loginForm.rememberMe} />
										<Form.Label class="font-normal">Remember Me</Form.Label>
									</div>
								{/snippet}
							</Form.Control>
						</Form.Field>
						<!-- Forgot Password -->
						<Button
							variant="link"
							class="text-xs"
							disabled={spinner.id === 'forgotPassword'}
							onclick={() => {
								setPage('forgot');
							}}
						>
							{#if spinner.id === 'forgotPassword'}
								<Spinner size="sm" />
							{:else}
								Forgot Password?
							{/if}
						</Button>
					</div>
					<!-- Submit -->
					<Form.Button type="submit" disabled={$loginSubmitting} variant="bold" class="w-full">
						{#if $loginSubmitting}
							<Spinner />
						{:else}Login{/if}
					</Form.Button>
				</form>
				<!-- DIVIDER -->
				<Divider text="or login with" />

				<!-- Social Login -->
				<!-- GITHUB -->
				<div class="flex w-full flex-col gap-2">
					<Button
						variant="outline"
						class="w-full"
						type="submit"
						formaction="?/loginSocial"
						onclick={() => authClient.signIn.social({ provider: 'github' })}
						><Icon icon="logos:github-icon" />Login with Github</Button
					>
					<!-- DISCORD -->
					<Button
						variant="outline"
						class="w-full"
						type="submit"
						formaction="?/loginSocial"
						onclick={() => authClient.signIn.social({ provider: 'discord' })}
						><Icon icon="logos:discord-icon" />Login with Discord</Button
					>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		gap: 1rem;
	}
</style>
