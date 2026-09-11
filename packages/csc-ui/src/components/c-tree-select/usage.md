A hierarchical value-selection component: a readonly value field that opens a panel for browsing a tree one level at a time, or searching it as a whole, to commit one item.

## Items

The tree is the `items` property: an array of `{ value, name }` entries where
an entry with a non-empty `children` array is a branch and any other entry is
a leaf. Values must be unique across the whole tree. An optional `code` — a
classification number, say — is shown before the name in a muted column and
is matched by the search. Arrays have no attribute form, so bind `items` as a
DOM property (`:items.prop` in Vue; the React wrapper and property assignment
do this naturally):

```ts
const items: CTreeSelectItem[] = [
  {
    value: '1',
    code: '1',
    name: 'Natural sciences',
    children: [
      {
        value: '111',
        code: '111',
        name: 'Mathematics',
        children: [{ value: '1111', code: '1111', name: 'Pure mathematics' }],
      },
    ],
  },
];
```

A `disabled` branch cannot be entered and a `disabled` leaf cannot be
committed; both render as disabled rows, and the items below a disabled
branch are listed disabled in search results.

The value is the committed item's `value`, or `null` when nothing is
committed. With `return-object` the value is a fresh `{ value, name, code,
path }` object instead — `path` holds the item's ancestors root-first, each
as `{ value, name, code }` — never the `items` entry itself, and never its
children. The closed field shows the committed item's path on a muted line
above its code and name.

## Browsing and searching

The panel lists one level at a time: the top-level items first, then the
children of whichever branch is picked, with a breadcrumb above the list —
the root crumb ("All") followed by one crumb per ancestor — for climbing
back. The header names the level being chosen: give `level-labels` an array
of names, top level first ("Main field", "Field", "Subfield"), and it reads
"Choose Field"; a level without a name reads "Choose Level 2". While the
tree is evenly deep — every leaf at the same level — the header also counts
the steps ("Step 2 of 3"); in an unevenly deep tree the counter is left out,
and a level made only of leaves says "Final level" instead. Reopening the
panel returns to the committed item's level with its row selected, so its
siblings are one click away.

Typing into the search input switches the panel to a flat list of matches
from the whole tree, each with its path on a second line. The query is
matched case-insensitively anywhere in the name or code of an item and of
every ancestor above it, so a query matching a branch lists all of its
leaves. Supply a `filter` predicate to change the matching — it receives the
item, the query and the item's ancestors, and lists the item when it returns
`true`. Because `filter` is a function, it must be bound as a DOM property.
Deleting the query, or the "Browse instead" control in the header, returns to
the level the user was browsing.

While a query is typed, the runs of each row's code, label and path that
equal it are marked. The marks are the `match` part, the path line the `path`
part and the code column the `code` part:

```css
c-tree-select::part(match) {
  font-weight: 600;
}
```

From the keyboard, ArrowDown and ArrowUp move through the rows and Enter
activates one: a branch descends, a leaf commits. ArrowRight descends into a
highlighted branch and ArrowLeft — or Backspace with nothing left to delete —
climbs one level. Escape closes the panel and returns focus to the field; Tab
closes it and moves on.

## Committing a branch

By default only a leaf can be committed; a branch always opens its children.
Set `allow-branch` to let a branch be the value as well: every level below
the root then starts with a pinned select-branch row ("Select Natural
sciences") that commits the branch the user is in, and branches matching a
query are listed as search results and commit directly. The pinned row is the
`select-branch` part.

## Texts

Every built-in string — the root crumb, the header texts, a branch row's
child count, the select-branch row's label, the "Browse instead" control, the
no-results row, the search input's placeholder and accessible label, the
clear and toggle button labels — can be replaced for another language through
the `texts` object, merged over the English defaults. Interpolated texts are
functions, so the object must be bound as a DOM property; the `placeholder`
prop still wins over `texts.searchPlaceholder` when both are set:

```vue
<c-tree-select
  :texts.prop="{
    root: 'Kaikki',
    choose: (level) => `Valitse ${level}`,
    children: (count) => `${count} alakohtaa`,
  }"
/>
```

To translate every tree select at once, set `texts` app-wide with
`applyDefaults({ 'c-tree-select': { texts } })` (Customization → App-wide
prop defaults); a per-instance `texts` still wins key by key.

## Scrolling

The panel shows `items-per-page` full rows (six by default) and then a
half-visible row instead of a scrollbar: the cut row is the cue that more
items follow, and the wheel, touch and arrow keys scroll as usual. Set
`items-per-page="0"` to let the list grow to the space the panel allows; it
still ends on a half row when it overflows. To bring the native scrollbar
back:

```css
c-tree-select::part(list) {
  scrollbar-width: auto;
}
```

## Lazily loaded trees

The component walks the `items` you give it and has no loading state of its
own: there is no `external` mode and no per-branch fetch event yet. A tree
that arrives in pieces can still be shown by re-assigning `items` with the
fetched `children` filled in — the panel keeps its level and re-homes the
highlight when the tree changes. A branch must already list its children to
be enterable, so load at least one level ahead of the user.
