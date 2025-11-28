# ✨ The Playdeck 🃏

The playdeck is a unique Svelte component that is built using the Character mechanics.

It is a dynamic Svelte Component that accepts a "deck", and dynamically renders this deck into a [GridStack](https://gridstackjs.com) (a drag&drop, configurable grid), using the package ["svelte-grid"](https://github.com/valqelyan/svelte-grid).

## ⚙️ Widgets

The Deck renders out components defined in the "widgets". Widgets hold all information a component needs in order to be rendered, both for the component and the deck information, as well as the GridStack information.

### Properties

A widget is defined as an object with the following properties:

- `name`: The (friendly) name of the component
- `component`: the Svelte Component itself, stored in a property
- `system: CharacterSystems`: The game system that the component is linked to.
- `initialLayout`: The initial GridStack information for the component typed as `type WidgetGridStackProps`, which is used to determine the width, height and position of the component in the GridStack when the deck is initialized.
- `[columns: number]`: The actual GridStack information for the component typed as `type GridStackItemProps`, which is used to determine the width, height and position of the component in the GridStack when being rendered.

> **On the columns property:**
> For every amount of columns, a new property is added to the widget with the information. The name of the property is a `type number`, associated with the amount of columns.

### Defining widgets

Every style of game system, from Dungeons & Dragons to Fate, has its own information to be rendered. This is information is stored in the `character` instance laoded from the database.

However, character also hold generic information, such as their names, images and description. Therefore, there are also "generic" components defined.

Each of the available widgets and their Svelte components are defined in their own folder under this directory ([`$lib/components/playdeck`](../playdeck/)).

> Example: [`./arcaneRift/Aspects.svelte`](./arcaneRift/Aspects.svelte) defines the Svelte component for the Arcane Rift aspects.

All available widgets per game system are mapped as a `WidgetMap` in the `index.ts` under their system (like [`./arcaneRift/index.ts`](./arcaneRift/index.ts)). The map is a `type Record<string, SystemWidget>` where the key is the id of the widget and the value is the widget itself.
Here, the components are also imported to be used in the Deck. This means that the component _DO NOT_ have to be imported manually in the Deck.

> **Type**\
> Widgets defined for each system are named `type SystemWidget`. The map that holds these widgets requires an unique id (key) for each widget.

### Complete Widget Map

In order to access all widgets and support flexible development and importing of new systems, a complete Map instance is defined in the `index.ts` file under this directory [`$lib/components/playdeck/index.ts`](./index.ts).

> **IMPORTANT!** .\
> The type of the widgets defined in the system-specific `widgetMaps` and the widgets in the full `widgetMap` are **NOT** the same, as their properties are slightly manipulated.\
> The type of the widgets in the full `widgetMap` is derived from `type SystemWidget` as `type MappedWidget`

#### ID and System Info

Widget maps from different systems need to be clearly distinguished from each other. Therefore, system-specific maps are not simply combined, but slightly modified using the System Key (defined in [`$lib/gameSystems/index.ts`](../../gameSystems/index.ts) as `GENERIC_KEY` for example).

> **Note**\
> To support gradual development of new systems for each domain (cards, characters, campaigns), available systems for the Deck (derived from the Characters) are defined in [`$lib/domain/characters/character.svelte.ts`](../../domain/characters/character.svelte.ts) with `type CharacterSystems`.

The following manipulations are applied:

- The property `system: CharacterSystems` is added. It is to determine which system the widget is associated with.
- The Key `type string` is prefixed with the System Key. For example, the key `[description]` from the `GENERIC_KEY` system is now `[${GENERIC_KEY}:description]`.

The manipulations are done in the `defineDeckMap()` helper function.

### Storage and Database

Every character has its own deck. The configured deck is stored in the database, as well as the [`class Character`](../../domain/characters/character.svelte.ts) instance (where it is converted back and forth).

Storing the deck info per character has 2 main reasons:

- Saving and retaining the components a deck is comprised of.
- Saving and retaining the GridStack information for each component, such as size, order and position for every column (breakpoint).

Any other Widget Information, such as the component, friendly name or initialLayout, have no purpose being stored in the database or Character instance.
To accomode these functionalities:

- `type StoredDeck` is added, which is an Array of objetcs holding the id of the widget (as defined in the [complete widget map](#complete-widget-map)) and the GridStack information for the component. As such:\
  (see [index.ts](./index.ts) for the exact type)

```ts
type StoredDeck = Array<
	{
		id: string;
	} & Record<number, GridStackItemProps>
>;
```
