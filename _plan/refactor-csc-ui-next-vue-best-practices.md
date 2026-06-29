# Refactor csc-ui-next components to Vue best practices (props, refs, ids)

## Context

`packages/csc-ui-next` is the Vue 3 rewrite of the CSC UI library — 67 SFCs compiled to
Web Components via `defineCustomElement` (`vite.config.ts` → `customElement: /\.vue$/`,
registered in `src/shared/defineElement.ts`). The components predate the
`/vue-development` skill and don't yet follow its conventions for **props**, **template
refs**, and **unique ids**. This refactor aligns them with the skill.

**Emits are explicitly out of scope.** The skill recommends type-based `defineEmits<{...}>()`,
but these components are custom elements that dispatch native `CustomEvent`s — several with
`bubbles: true, composed: true` so events cross shadow-DOM boundaries (e.g. `c-tab`→`c-tabs`
`tabChange`/`tabFocus` at `CTab.vue:31-35` / `CTabs.vue:452-462`; `c-accordion-item`→
`c-accordion`; `c-dropdown`/`c-option`→`c-select`). Vue's `defineEmits` in a custom element
dispatches **non-bubbling, non-composed** events and cannot express those flags, so converting
would silently break parent↔child wiring. This event contract is already documented in
`docs/adr/0003-csc-ui-next-vue-defineCustomElement.md`. Event dispatch stays as-is.

## Goals (per the skill)

1. **Props** → type-based `defineProps<Props>()` + `withDefaults(...)`, replacing the runtime
   `defineProps({ type, default })` object form.
2. **Template refs** → `useTemplateRef("name")` for every template ref, with `xxxRef` naming
   throughout (including renaming existing well-named ones).
3. **Unique ids** → `useId()` replacing module-level `let uid = 0` counters.

## Approach: pilot first, then roll out

### Phase A — Pilot (5 components)

Chosen to cover every edge case before touching the other ~62:

| Component | Why it's in the pilot |
|---|---|
| `c-text-field/CTextField.vue` | Plain props + counter id + plain `ref` (`inputEl`); has nullable-default props (`min/max/step`) |
| `c-checkbox/CCheckbox.vue` | id-override prop (`hostId`) + `useHasSlot(root, ...)` rename impact |
| `c-select/CSelect.vue` | Complex typed refs (`dropdownRef` w/ method interface), double counter (`uid` + `_uniqueId`), composed `inputId` |
| `c-tabs/CTabs.vue` | `uid` used to build **composed child ids** (`c-tab-item-${uid}-${i}`) consumed by ARIA |
| `c-otp-input/COtpInput.vue` | `v-for` **callback-array refs** (`setInputRef`) → `useTemplateRef` array |

Then run the build and verify (see Verification) before Phase B.

### Phase B — Rollout

Apply the proven transformations to the remaining components (all that have any targeted
pattern). Mechanical, following the pilot exactly.

## Transformation rules

### Props — runtime object → type-based + withDefaults

```ts
// before
const props = defineProps({
  label: { type: String, default: '' },
  rows: { type: Number, default: 1 },
  min: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
});

// after
interface CTextFieldProps {
  label?: string;
  rows?: number;
  min?: number | null;        // nullable-default props need `| null`
  disabled?: boolean;
}
const props = withDefaults(defineProps<CTextFieldProps>(), {
  label: '',
  rows: 1,
  min: null,
  disabled: false,
});
```

Rules:
- Name the interface `C<Name>Props`, placed above `defineProps`.
- Map union runtime types to TS unions: `type: [String, Number]` → `string | number`;
  `value: { type: [String, Number, Object], default: null }` (CSelect) → `string | number | SelectItem | null`.
- `PropType<T>` (e.g. CButton `override: Object as PropType<ButtonParts>`) → just `override?: ButtonParts`.
- **`default: null`** on a Number/typed prop → add `| null` to the TS type, keep `null` default.
- Object/array defaults stay as values in `withDefaults` (compiler wraps them) — keep
  `items: () => []` style factories where present.
- The SFC compiler turns `defineProps<T>()` into the runtime declaration `defineCustomElement`
  needs for attribute observation, so attribute reflection is preserved. **Do not destructure
  props** (keep `props.x`) to preserve reactivity — matches current code.

### Template refs — `ref()` → `useTemplateRef`, rename to `xxxRef`

- Convert remaining plain `ref(null)` template refs to `useTemplateRef<T>("name")` and ensure
  the `ref="name"` attribute matches the string arg (not the variable name).
- Rename **all** template refs to the `xxxRef` convention, e.g.:
  `root`→`rootRef`, `dialogEl`→`dialogRef`, `tabsEl`→`tabsRef`, `scrollEl`→`scrollRef`,
  `inputEl`→`inputRef`, `labelTopRef`/`labelInlineRef` already compliant.
- Update **all call sites** of renamed refs — notably `useHasSlot(root, ...)` → `useHasSlot(rootRef, ...)`
  in every component that uses it, and template `ref="..."` attributes.
- CSelect: `dropdownRef`/`cInputRef`/`inputRef`/`selectionRef` are already `xxxRef`-named plain
  refs → swap to `useTemplateRef`, carrying the inline method-interface type onto the generic.
- COtpInput: replace the `setInputRef` callback-array with a single
  `const inputsRef = useTemplateRef<HTMLInputElement[]>("inputsRef")` and `ref="inputsRef"` on
  the `v-for` `<input>` (Vue 3.5 collects v-for refs into an array). Update focus/index logic
  that currently indexes the `inputs[]` array to read `inputsRef.value?.[i]`.

### Unique ids — counter → `useId()`

```ts
// before
let uid = 0;
const inputId = computed(() => props.hostId || `c-text-field-${++uid}`);

// after
import { useId } from 'vue';
const autoId = useId();
const inputId = computed(() => props.hostId || autoId);
```

- Preserve every id-override prop (`hostId`, `elementId`, …): `props.hostId || autoId`.
- Composed child ids (CTabs `c-tab-item-${uid}-${i}`, COtpInput `${resolvedId}--input-${i}`)
  build off the `useId()` base instead of the counter.
- Remove the now-dead `let uid = 0` / `let _uniqueId = 0` and any `uid += 1` in `onMounted`.
- Safe under shadow DOM: each component renders into its own shadow root, so identical
  `useId()` values across instances don't collide, and it removes the latent `++uid`-inside-
  `computed` bug.

## Critical files

- Pilot: the 5 files in the table above.
- Shared helper affected by ref renames: `src/shared/useHasSlot.ts` (signature unchanged; only
  call-site argument names change).
- Reference only (no change): `src/shared/defineElement.ts`, `vite.config.ts`,
  `docs/adr/0003-csc-ui-next-vue-defineCustomElement.md`.

## Verification

1. **Build**: `cd packages/csc-ui-next && npm run build` — must pass with no TS errors
   (strict mode is on). Type-based props are the main risk; watch nullable defaults and unions.
2. **Lint/format**: run the repo's ESLint/Prettier over changed files.
3. **Render check**: load the built components (docs site or a scratch HTML page registering
   `defineCustomElements()`), and confirm for the pilot set:
   - `c-text-field` / `c-checkbox`: `label[for]` ↔ input `id` association works (inspect the
     shadow root); typing emits `update:value` and v-model still binds.
   - `c-tabs`: tab/panel ARIA (`aria-controls`/`id`) still links and tab switching works.
   - `c-select`: dropdown open/close/select via the `dropdownRef` methods still works.
   - `c-otp-input`: per-digit focus navigation (arrow/backspace/paste) works with the new
     `useTemplateRef` array.
4. Confirm no `update:value`/`changeValue`/bubbling events changed (emits untouched).

## Notes

- Per user preference, on approval the plan will also be placed in the repo's `_plan/` folder.
- No ADR/CONTEXT.md changes needed — the emits-exemption rationale is already covered by
  ADR-0003, and no glossary terms change.
