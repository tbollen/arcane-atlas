# The PlayDeck

The folder "Playdeck" contains a component called "Deck", which accepts a configuration of deck components that are dynamically rendered.

## Rendering

You can call the `Deck` component like any other component in a Svelte page, layout or partial. It will require certain properties to function and will dynamically render the components as defined in its configuration.

### Properties

To render a Deck component, the following properties are required:

- `character` (StoredCharacter): The character to render the deck for.
- `deck` (DeckConfig)
  - 'system' (DeckSystems): The system to render the deck for. Available systems are defined in the Deck component itself
  - 'config' (DeckComponents[]): An array of components to render. Available components are "mapped" in the `index.ts` files for each system (+ 'generic')

## If you want to add a new component, do the following:

1. Create a new component in the correct folder in `playdeck/[system]`. Make sure it has the required properties from the `type DeckProps` defined in `playdeck/types.ts`.
2. Make sure both the character and edit properties are defined as `$bindable()`. You can do this as such: `let { character = $bindable(), edit = $bindable() } = $props();`
3. Add the component to the `index.ts` file of the system you want to add it to. Make sure the component itself is both exported as "default", as well as added to the `type ...Options` and the exported `const ...ComponentMap`
4. If you added a new system. Make sure to add an `index.ts` file like the other ones and add both the imported components, as well as the map to the `Deck.svelte` component.
