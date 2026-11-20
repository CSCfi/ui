# What is left before csc-ui 4.0.0 (grill, 2026-11-17)

**Status (2026-11-19): step 1 done on `development`; steps 2–5 wait for the gate.** Commits 2c887d7c, a3eba94e,
c2d0f2a9, plus the records commit. Two changes to the plan below, found while doing step 1:
- `netlify.toml` lives in `packages/csc-ui-documentation/`, not the repo root, where the 3.x file sat. Netlify
  finds it there but resolves `publish` from the repo root (the first PR #328 preview failed on "Deploy directory
  'dist' does not exist", resolved to `/opt/build/repo/dist`), so `publish` is `packages/csc-ui-documentation/dist`.
- Under `NETLIFY=1`, `nuxt generate` resolves Nitro's netlify-static preset (output `dist/`, a `_redirects` for
  the child routes, `/* /404.html 404`), and that build never prerendered `/getting-started`, `/migration` or
  `/data-visualization`: the side navigation links them by `value`, not `href`. `nuxt.config.ts` now seeds every
  top-level page into `nitro.prerender.routes` (58 routes on the Netlify preset, 139 on the plain one).

## Context

`@cscfi/csc-ui` + `@cscfi/csc-ui-react` are at `4.0.0-rc.8` on npm (2026-11-16, version PR #327). `development` =
`origin/development`; `main` holds the rc version commits; main's `.changeset/pre.json` (tag `rc`) has consumed all
252 changesets on disk. `_plan/csc-ui-4-stable-release.md` phases 0–4 are done; phase 5 (4.0.0) is gated by D8.
The grill found no missing component work. What's left is the release mechanics plus four gaps in them: the changelog
rule predates the RCs, required checks would block the bot's Version PR, the docs' Netlify build config is from the
3.x era, and some leftover files aren't committed.

## Decisions (user, 2026-11-17)

- **G1 — D8 gate.** Met when MyCSC's rc.8 branch is merged with its CI green plus one manual pass (login;
  reset-password with a password manager). A local e2e run past the CSC IdP is not required.
- **G2 — 4.0.0 changelog = curated text only.** In `exit` mode changesets puts every changeset still on disk into the
  stable entry (`@changesets/assemble-release-plan` `getRelevantChangesets`, `mode !== "exit"` guard), so the exit
  PR deletes all of them and adds one hand-written major for both packages. Alpha/rc sections stay in CHANGELOG.md.
- **G3 — Curated entry: short + themed** (~20 lines): what 4.0 is, migration-guide link, breaking changes in 5–7
  themes (events, `invalid`, `::part()`/tokens, renames/removals → guide, removed tags, React wrapper), the names
  deprecated until 5.0, supported browsers, 3.x frozen at 3.0.19. Check every fact against source: guide URL (docs
  route), removed tags (`packages/csc-ui-documentation/scripts/v3-api.json` vs `src/registry.ts`), deprecated
  names (manifest `deprecated`), browsers (`browserslist`). The user reviews the text before the exit PR.
- **G4 — Required checks, set by the user before the exit PR:** `build-lint-test`, `Behaviour specs (firefox)`,
  `Behaviour specs (webkit)` (ci.yml), `require-changeset` (changeset-check.yml). `release.yml` opens the Version PR
  with `GITHUB_TOKEN`, so no `pull_request` workflow ever runs on `changeset-release/main` and the checks never
  report there → **an admin bypass merges the Version PR** (keep "enforce for admins" off, or a ruleset bypass).
- **G5 — Pin the 4.x Netlify build in a `netlify.toml`** (in the docs package, see Status). The site builds from `main` on Netlify. The 3.x
  `packages/csc-ui-documentation/netlify.toml` (only a `/* → /index.html` SPA redirect) went in 84882b8b, so the
  build settings in the Netlify UI date from 3.x.
- **G6 — Known gaps don't block:** iOS Safari untested, Android long-press check on toast swipe, c-tab-item's
  undeclared `[disabled]` hook (outside the manifest contract). All go on the 4.0.x follow-up list.
- **G7 — Commit the leftovers:** the 8 untracked `_plan/*.md` (done work) and the `.devcontainer/Dockerfile` Firefox
  140 libs.
- **Checked, nothing to do:** `check-api-breaks.mjs` treats only `mode === 'pre'` as frozen, so the exit PR's major
  changeset passes; TanStack types never reach `dist-types`; `customElements`/`web-types`/`browserslist`/`files`/
  `exports` are set; READMEs pin 3.x with `@3`; no `@rc`/`@next` install commands remain.

## Work, in order

### 1. On `development` (me, now; each commit with an empty changeset, `pnpm changeset --empty`)
1. `Docs: Plans for the work since rc.5`: add the 8 untracked `_plan/*.md`.
2. `Chore(devcontainer): Libraries for Firefox 140 ESR`: the staged Dockerfile hunk.
3. `Chore(docs): Pin the Netlify build`: repo-root `netlify.toml`:
   - `[build] command = "pnpm --filter @cscfi/csc-ui build && pnpm --filter @cscfi/csc-ui-documentation generate"`.
   - `publish` = wherever Nitro writes under `NETLIFY=1 nuxt generate`. Confirm it locally (`.output/public` or
     `dist`; the local `dist` is an absolute symlink, so don't rely on it).
   - `[build.environment] NODE_VERSION = "24"`. pnpm comes from `packageManager` (`pnpm@11.3.0`). Add
     `NODE_OPTIONS` only if the preview build OOMs.
   - No redirects block.
4. `Docs: The road to 4.0.0 in the records`:
   - ADR-0028's 2026-10-23 amendment: "released in an alpha" → "released in a prerelease (alpha or rc)", plus one
     line on the admin-bypass Version PR (G4).
   - Same reason in a comment above the changesets step in `.github/workflows/release.yml`.
   - `_plan/csc-ui-4-stable-release.md`: amend D7 (G2) and D8 (G1), replace phase 5 with this runbook, add the G6
     items to phase 6.
   - Copy this plan to `_plan/csc-ui-4-0-0-readiness.md`.
5. Draft the curated changeset text (G3) and show it to the user. It is committed in step 4 below, not here.

### 2. Gate (user)
MyCSC's rc.8 branch merged, its CI green, the manual login + reset-password pass done (G1). Set the four required
checks (G4).

### 3. PR A: `development` → `main`
- Resolve the known `packages/csc-ui/package.json` conflict with main's version and development's description.
- Check the Netlify deploy preview: `/`, `/getting-started`, `/migration`, one component page, `/v3/` and one 3.x
  component route, and that an unknown path returns 404.
- Merge. The release action opens an rc Version PR for the empty changesets: **leave it unmerged**, because the exit
  PR rewrites it to 4.0.0 (same trick as alpha.33 → rc.1).

### 4. Exit dry run, then PR B (exit)
- Dry run in a throwaway worktree off `main`:
  - Run `pnpm changeset pre exit`.
  - Delete every `.changeset/*.md` except `README.md`, and add the curated `---\n'@cscfi/csc-ui': major\n'@cscfi/csc-ui-react': major\n---` file.
  - Run `pnpm changeset version`. Expect: both packages `4.0.0`, `pre.json` gone, no changeset left, and the top
    CHANGELOG section of both packages = the curated text only.
  - Run `node packages/csc-ui/scripts/check-api-breaks.mjs --base origin/main`: it should pass.
- PR B, a branch from `main` with the same three changes (no version edit, no other content), keeping it separate
  from PR A as at rc entry. Merge.
- The Version PR becomes `4.0.0`. Review its CHANGELOGs, then merge it with an admin bypass. `release.yml` publishes
  both packages under `latest` with GitHub releases, and Netlify builds `main`.

### 5. After publish (user, npm owner login with 2FA: trusted publishing covers only `publish`)
```
npm dist-tag rm @cscfi/csc-ui alpha && npm dist-tag rm @cscfi/csc-ui rc   # same two for -react
npm deprecate @cscfi/csc-ui-vue "Retired: csc-ui 4 needs no Vue adapter. See https://design-system.csc.fi/migration"
npm deprecate @cscfi/csc-ui-vue2 "<same>"
```
Then:
- MyCSC moves to `^4.0.0` and drops its rc `minimumReleaseAgeExclude` entries.
- Merge `main` back into `development`, so the versions and CHANGELOG stop drifting (the cause of the recurring
  package.json conflict).
- Update the release memory (and trim MEMORY.md, which is over its size limit).

## Verification
- After step 1: `pnpm lint` and `pnpm format:check` pass, and `git status` is clean. `NETLIFY=1 pnpm --filter
  @cscfi/csc-ui-documentation generate` writes the dir that `netlify.toml` publishes.
- Step 3: the deploy preview checks above.
- Step 4: the dry-run expectations above, then on the Version PR the same diff as the dry run.
- After publish:
  - `npm view @cscfi/csc-ui dist-tags` (and `-react`) shows `latest: 4.0.0`, with no `alpha` or `rc`. No `v3` tag: npm refuses it (a valid
    range), and `@3` resolves to 3.0.19.
  - `npm view @cscfi/csc-ui-vue deprecated` is non-empty. CONTEXT.md's claim is now true.
  - The CHANGELOG 4.0.0 entry is the curated one.
  - A plain HTML page that loads `dist/csc-ui.js` from the published tarball upgrades every tag.
  - design-system.csc.fi serves 4.x with `/v3/`.
