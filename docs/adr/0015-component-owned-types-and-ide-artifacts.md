---
status: accepted
---

# Prop-value types are component-owned exported unions; the manifest carries expanded unions and drives generated IDE artifacts

Enum-shaped prop values in `csc-ui-next` were widely typed as bare `string` (~20 components: `size`, `align`, `type`, …, seeded from the Stencil source), and the types that did exist as unions were trapped inside `<script setup>`, unreachable to consumers. Meanwhile ADR-0012 chose the CEM manifest partly *for* its IDE-tooling ecosystem, but no IDE artifact was ever generated. This ADR fixes all three at once: every set-of-accepted-values prop gets a named, exported union; the manifest exposes those unions in expanded literal form; and VS Code / JetBrains completion data is generated from the manifest.

## Where types live (amends ADR-0012)

ADR-0012 put all "shared public types" in `src/types.ts`. That bullet is superseded by an ownership split (terms in `CONTEXT.md`):

- **Component-owned type** — belongs to exactly one component; declared in a second plain `<script lang="ts">` block in that component's SFC (exports from a plain `<script>` block are module exports of the `.vue` file and share module scope with `<script setup>`), re-exported from `src/index.ts`, named `C<Component><Concept>` (`CButtonSize`, `CAlertType`).
- **Shared type** — the value **crosses a component boundary** (`CSelectItem`, accepted by both `c-select` and `c-autocomplete`); stays in `src/types.ts`, which now holds *only* these. Textual equality is not sharing: `c-card-actions` and `c-login-card-actions` declaring identical `align` sets is clone heritage, not contract — each keeps its own union so they can diverge (`c-icon-button`'s `x-small` shows sizes already have).

The analyzer extracts exported types from both locations; `src/index.ts` re-exports are linted for completeness rather than trusted.

## Union contents and runtime posture

- Unions contain **only behavior-bearing documented values**. `''`-means-default (the old docs' convention) is not a member — `CAlertType` drops `''`; omitting the attribute is how you ask for the default. Narrowing `string` → union is safe pre-1.0: the compat promise is at tag/attribute runtime level, where nothing changes.
- Invalid attribute values at runtime (plain-HTML users can always deliver arbitrary strings) **silently fall back to the default variant** — the platform's own convention (`<input type="bogus">` → text) and already `c-alert`'s pattern. No dev-mode warnings, no Vue prop validators; typos are attacked at authoring time by the IDE artifacts instead.
- Where a union directly drives a `tailwind-variants` map, the map is typed `satisfies Record<Union, …>` so union/variant drift is a compile error. Unions that deliberately superset the variants (`CAlertType`'s `'default'` vs the single `default` variant) own that mapping in component code.

## Manifest representation

The manifest's standard `type.text` field carries the **transitively expanded literal union** (`"'default' | 'error' | 'info' | 'success' | 'warning'"`); the alias name moves to the `csc` vendor extension for the docs site's type cross-links *(originally a central Types page; amended 2026-07-03 — types render in a Types section on their owning component's page, shared types duplicated onto every referencing page per ADR-0013's self-containment rule, and prop-table links become same-page anchors)*. Rule: standard fields carry maximally standard content (third-party generators parse `type.text` for value sets and cannot see our extensions); our quirks ride in `csc`. Only literal unions are expanded — interfaces, functions, and object shapes keep their names (they are property-only and never become attributes).

## IDE artifacts

From the manifest, ecosystem generators (`@wc-toolkit/vs-code-integration`, `@wc-toolkit/jetbrains-integration`) emit `vscode.html-custom-data.json`, `vscode.css-custom-data.json` (parts / custom properties), and `web-types.json` into `dist/`. Web-types is advertised via the package.json `web-types` field (JetBrains auto-discovers it); the VS Code `html.customData` setting (also read by Volar for Vue templates) is documented for consumers. Hand-rolling these emitters was rejected: ADR-0012 rejected a bespoke `docs.json` *because* it forfeited exactly these generators — paying for CEM and then declining its ecosystem would be incoherent. The bespoke analyzer exists because nothing else parses our SFC conventions; that reasoning does not apply downstream of a standard manifest.

## Enforcement

Analyzer strict mode (already in `build`) fails on any attribute-compatible prop typed bare `string` unless its docblock carries a `@freeform` tag declaring it intentionally open-ended (`c-icon`'s `color` — any CSS color; `c-login-card`'s `backgroundPosition` — any CSS position). The tag flows into the manifest so docs and IDE data can render "any CSS color" instead of `string`. Review-only convention was rejected (the 20 existing offenders prove it doesn't hold); a suspect-name heuristic was rejected as both leaky and noisy.

## Considered alternatives

- **Central `src/types.ts` for everything** — zero pipeline change, but turns one file into a 70-component dumping ground and severs types from the props they constrain. Rejected.
- **Colocated `types.ts` per component folder** — trivially analyzable, but splits a component's API across two files while the props interface stays in the SFC (the analyzer resolves `defineProps<Interface>()` by same-file lookup). Rejected.
- **Shared types declared in an "owning" component, others importing from the `.vue`** — kills `src/types.ts` entirely but invents false ownership (`CSelectItem` is not more c-select's than c-autocomplete's) and makes refactors order-sensitive. Rejected.
- **Alias name in `type.text`, expansion in a vendor extension** — inverts the standard/vendor rule and forces post-processing before third-party generators can see value sets. Rejected.
- **Analyzer lint comparing unions to parsed `tv` variant keys** — duplicates what `satisfies` gives natively, at the cost of parsing `tv` configs out of ASTs plus opt-outs for the superset cases. Rejected.
