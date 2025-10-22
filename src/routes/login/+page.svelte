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

	// Superform stuff
	import { loginFormSchema, registerFormSchema } from './formSchema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	// Auth stuff (for SSO)

	// LOAD from server
	let { data } = $props();

	///////////////////////////
	// SUPERFORM FORMS STUFF //
	///////////////////////////
	// REGISTER
	const form_register = superForm(data?.registerForm, {
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
	const form_login = superForm(data?.loginForm, {
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

	///////////////////////
	// END OF FORM STUFF //
	///////////////////////

	// Page param for registering / logging in
	let showRegister: boolean = $state(false);
	// State for social provider
	type validProviders = 'github' | 'discord'; //TODO: dynamically get
	let provider: validProviders | undefined = $state();

	let session: any;

	onMount(async () => {
		session = await authClient.getSession();
		if (session && session?.data?.user) goto(`${base}/account`);
	});
</script>

<main>
	<!-- {#if formResponse?.message}
		<p>{formResponse?.success ? 'Success' : 'Error'}: {formResponse?.message}</p>
	{/if} -->
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			{#if showRegister}
				<Card.Title>Register a new account</Card.Title>
				<Card.Description>Enter your email below to register a new account</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => (showRegister = false)}>Sign In</Button>
				</Card.Action>
			{:else}
				<Card.Title>Login to your account</Card.Title>
				<Card.Description>Enter your email below to login to your account</Card.Description>
				<Card.Action>
					<Button variant="link" onclick={() => (showRegister = true)}>Register</Button>
				</Card.Action>
			{/if}
		</Card.Header>
		<Card.Content>
			{#if showRegister}
				<!-- REGISTER -->
				<form method="POST" class="!p-0" action="?/register" use:registerEnhance>
					<!-- Username -->
					<Form.Field form={form_register} name="displayName" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Username</Form.Label>
								<Input {...props} bind:value={$registerForm.displayName} />
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
								<Input {...props} bind:value={$registerForm.email} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Password -->
					<Form.Field form={form_register} name="password" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<Input {...props} type="password" bind:value={$registerForm.password} />
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
											href="https://github.com/tbollen/arcane-rift-companion/blob/main/static/terms-and-conditions.md"
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
											href="https://github.com/tbollen/arcane-rift-companion/blob/main/static/privacy-policy.md"
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
			{:else}
				<!-- LOGIN -->
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
								<Input {...props} type="password" bind:value={$loginForm.password} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
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
