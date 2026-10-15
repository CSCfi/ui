# File upload component: grilling record + implementation plan

> **Status: IMPLEMENTED 2026-10-12, committed 2026-10-15.** Component, pure-logic module (`files.ts`, 38 node tests),
> behaviour spec (38 browser tests), 14 visual baselines, conformance enrolment (value controls, all components,
> mode scope, projected ink), API snapshots, React wrapper, usage.md, seven docs canons in all flavours, CONTEXT.md
> entries, ADR-0071 (Accepted) and a changeset. `pnpm build`, the CI `type-check`, `pnpm lint` and
> the docs example smoke pass.
> Not yet done: the manual checks (a real OS drag, a phone, a screen reader, Firefox ESR) — see Verification.
>
> Deviations from the plan below:
> - The drop zone's dashed edge takes `border-strong`, not `divider`: it is an operable control's boundary
>   (3:1, like the field outline). Rows keep the `divider` hairline.
> - Row actions are native buttons, not `c-icon-button`: no c-* children in the shadow root, so registration
>   order is free and focus after a removal needs no reach into a nested shadow root.
> - A retry also emits the value events (a user interaction that changes the entry); ADR-0071 says so.
> - `upload` is typed `CFileUploadFunction` without `| null`: the analyzer resolves an alias only when it stands
>   alone, and `| null` made it list `upload` as an attribute.
> - The hidden file input's composed `input` event is stopped, so the host's `input` always means a value change.
> - Disabled controls take no pointer events: a disabled native button may swallow a drag, and the drop must
>   reach the root or the browser opens the file in the tab.
> - Extra texts keys `uploaded` (the done row's check mark) and `uploading` (before the first progress report).
> - Unmounting aborts in-flight uploads (the signal lets the upload function clean up).
> - A rejected row's line is `size · reason` (a folder shows the reason only — its size is a placeholder).

## Context
`_todo/upload-component.md` asks for an upload component: add files by clicking or dropping on a drop zone,
progress display, file-size display, configurable accepted file types. Grilled 2026-10-12.

Research findings that constrain the design:
- No prior art: neither 3.x (Stencil) nor 4.x ever had an upload / file / drop-zone component; no code in
  `packages/` touches `DataTransfer`, `FileList`, `accept`, drag-and-drop or byte formatting.
- No component is form-associated (CSelect.vue:477-481, ADR-0023: "library-wide decision"); the only
  `attachInternals()` is `shared/useHostStates.ts`.
- Reusable: `shared/FormLabel.vue` (group label), `shared/FieldMessage.vue` (hint/error line),
  `shared/useHostStates.ts` (custom states), `shared/useStatusAnnouncer.ts` (polite live region),
  `shared/emitModelValue.ts` (`emitModelChange`), `shared/useHostEmit.ts`, `useAppDefault` + `texts` pattern
  (function-valued keys for interpolation), `c-number-field/numbers.ts` (cached `Intl.NumberFormat`, page lang),
  `c-icon-button` (remove/cancel), `c-progress-bar` (no accessible-name API today), `c-progress-circle`.

## Decisions (grilling log)
1. **Transport is the consumer's; the queue is the component's.** An `upload` property
   `(file, { onProgress, signal }) => Promise<result>` the component calls per file; the component owns queue,
   status, progress display, cancel (`AbortSignal`) and retry. Without `upload` the component is a plain file field
   holding the picked files. Rejected: the consumer writing progress back onto entries (state bookkeeping through a
   CE property); the component running XHR itself (`action`/`headers` — the library would own auth, CSRF,
   presigned URLs, chunking); no upload at all (drops the progress feature).
2. **The value is a list of file entries.** `{ id, name, size, type, file?, status, result?, error? }`, status
   `local | queued | uploading | done | error` (decision 13). Value events (`change`, `update:value`, `input` via `emitModelChange`) fire
   on a user add, a user remove and once per upload settle (done / error) — never on progress ticks, which are
   display only. Every emission is a new array of new entry objects. Files already on the server are entries
   without `file`, `status: 'done'`. Rejected: `File[]` + side-channel status (no way to show server files,
   `result` outside the model); results only (two value shapes by prop).
3. **`multiple` is opt-in; the value is always an array.** Without it the OS dialog picks one file, a drop takes
   the first file only, and a new pick replaces the current entry (aborting its upload). Native parity
   (`input.files` is always a list). Glossary **Multiple** gains a carve-out: on the file upload it governs how
   many files a pick adds, not the value's shape. Rejected: `multiple` switching `Entry | null` ↔ `Entry[]`
   (a union for consumers, two spellings of server files); `max-files` only (drops native vocabulary).
4. **Tag `c-file-upload`.** Types `CFileUploadEntry`, `CFileUploadTexts`, … Rejected: `c-upload` (verb;
   `upload.upload`), `c-file-input` (undersells the queue; collides with internal `c-input`).
5. **Uploads start on add, at most 3 in flight.** `queued` = waiting for a slot; the cap is internal, not a prop.
   Rejected: all parallel (a 40-file drop = 40 requests); manual start / `manual` prop (an extra click and a
   button with no clear owner, for a flow few need).
6. **Constraints `accept` / `max-size` / `max-files`; a breaking file is a rejected row, never an entry.**
   `accept` takes native syntax, filters the OS dialog and is re-checked on drop (a drop bypasses the dialog).
   `max-size` is bytes per file; `max-files` caps entries under `multiple` (entries already held count; the
   surplus of a drop, in drop order, is rejected). A rejected file shows as an error-styled, dismissible row with its
   reason (type / size / count), announced politely, and a `reject` event carries `{ file, reason }[]`. Rejected:
   `status: 'rejected'` entries in the value (consumers filter junk; a form submit carries it); silent drop + event
   (every consumer must wire a message).
   Defaults taken (no objection raised): rejected rows describe the latest add — they clear on the next add and on
   their ×; without `multiple`, the surplus of a multi-file drop is rejected ("only one file"), not silently ignored.
7. **Two drop-zone layouts: a large dashed zone (default) and `compact`.** Large: upload icon + "Drag files here or
   choose files", the whole zone one native `<button>` opening the dialog; touch devices (no hover / coarse pointer)
   read "Choose files". `compact`: a control-height row — "Choose files" button + "or drop files here", the whole
   row the drop target. Accepted types / limits are the consumer's **hint**; no generated summary. Rejected: large
   only (no form-row alignment); compact only (small target, little room for drag feedback).
8. **`compact` is `@defaultable false`; `size` (`CFieldSize`, `@defaultable 'default'`) sizes the compact row**
   (52 / 36px, the sibling fields' steps); the large zone ignores `size`. Rejected: per-instance `compact` with no
   size (misaligns a small form row); a `layout` enum (no third layout is asked for).
9. **File row: two lines + a hairline progress bar.** File icon · name (stem truncates, extension kept — CSS only,
   stem and extension in two spans) / status line (`482 kB`; `1.2 MB of 9.1 MB · 13%` uploading; waiting; the error
   text) · trailing actions. While uploading, a thin bar along the row's bottom edge — indeterminate until the first
   `onProgress`, then determinate — as a native `role="progressbar"` named after the file. Not `c-progress-bar`
   (16px + details line, no accessible-name API). Rejected: trailing `c-progress-circle` (competes with actions, no
   indeterminate phase by glossary); `c-progress-bar` per row (tall; needs a name API first).
10. **Sizes are decimal SI through `Intl.NumberFormat` units in the page `lang`.** 1 kB = 1000 B; `kilobyte` /
    `megabyte` / `gigabyte` `unitDisplay: 'short'` (en `1.2 MB`, fi `1,2 Mt`, sv `1,2 MB`) — no texts keys.
    Under 1 kB use `unitDisplay: 'long'` (`512 bytes` / `512 tavua`): ICU's en short byte is the odd `512 byte`
    (checked in node). The usage doc says to write `max-size` in decimal bytes (`10485760` reads "10.5 MB").
    Rejected: binary with KB labels (wrong labels, texts keys); KiB/MiB (unfamiliar, no Intl unit).
11. **Every entry carries an `id`; internal upload state is keyed by it.** The component generates ids for files
    it picks (prefixed, unique per page); the consumer's server entries carry their own (`id` is required in the
    type — every server file has one, and it doubles as a React `key`). For ids the component created, its own
    status / progress win over a value set back (a stale snapshot never rewinds an upload); a known id removed from
    `value` programmatically aborts its upload (silently — no emission). Unknown entries render as given. Rejected:
    identity + `toRaw` (React/immer clones lose progress and cancel); keyed by `File` (server entries have none;
    the same file twice collides).
12. **Row actions; removal is only a value change.** Queued: × removes. Uploading: × aborts (signal) and removes.
    Error: ↻ retry (only with a `file`) + × remove. Done: × removes. Every removal emits the value events; the
    consumer reconciles on submit or by diffing; server orphans are the server's job. Rejected: a `remove` hook
    (a second async lifecycle: removing / remove-failed); a cancelable `remove` event (no await, a new pattern).
13. **Statuses `local | queued | uploading | done | error`.** Without `upload` a picked file is `local`. Assigning
    `upload` sends every `local` entry to the queue — a consumer's manual start for free, no `manual` prop. The
    local → queued → uploading moves emit nothing; the settle emits (decision 2) — a value-control refinement for the
    glossary: this component also emits when an upload settles, not only on interaction. `pending` avoided (the
    **pending value**). Rejected: later `upload` ignoring earlier files (strands them); no status without `upload`.
14. **A failed row shows the rejection's message, else the `uploadFailed` text.** An `Error` with a non-empty
    `message` is shown — except a `TypeError` (fetch's "Failed to fetch") and a `DOMException` (abort / XHR), which
    are browser wording; anything else falls back. `entry.error` holds the string shown. Usage doc: don't rethrow
    raw server errors. Rejected: always generic + an `error` event; an `errorText` mapper (a second function prop).
15. **Not form-associated, like every sibling field.** No `name` prop. The usage doc shows building `FormData`
    from `value`. Rejected: the first form-associated component (a native form would submit the files but not the
    text fields beside them; needs a library-wide ADR).
16. **Accessibility.** Dragging is a pointer-only enhancement; the zone's native button is the keyboard / AT path.
    Rows are `role="list"`; actions are named per file ("Remove report.pdf", "Cancel upload of report.pdf",
    "Retry report.pdf"); after a removal focus goes to the next row's action, else the previous, else the zone.
    The polite live region (`useStatusAnnouncer`) announces adds ("2 files added"), each settle ("report.pdf
    uploaded", "data.csv failed: …") and rejections with their reason — never progress, which each row's
    progressbar exposes on demand. Rejected: failures only (silent success); progress milestones (chatter).
17. **The whole component is the drop target; the zone shows the highlight.** Zone, rows and label accept a drop
    (a near miss below the zone would otherwise open the file in the tab); no `document` listeners. Drag-over is
    the `drag-over` custom state (`:state(drag-over)`). A dropped folder is a rejected row (reason `folder`,
    detected via `webkitGetAsEntry()`). Rejected: a window-aware "ready" look (document listeners per instance);
    zone only (near misses navigate away).
18. **v1 scope: the core + per-type file icons.** Out: image thumbnails, clipboard paste, folders, reordering,
    chunked / resumable transport (the consumer's `upload` may chunk), a zone-content slot (texts cover wording).
19. **Eight outline icon categories, MIME then extension.** image `mdiFileImageOutline` · video
    `mdiFileVideoOutline` · audio `mdiFileMusicOutline` · document (pdf, word processing, odt, rtf, text/plain)
    `mdiFileDocumentOutline` · spreadsheet (xlsx, ods, csv, tsv) `mdiFileTableOutline` · archive (zip, gz, tar, 7z,
    bz2, xz) `mdiZipBoxOutline` · code/data (json, xml, yaml, scripts) `mdiFileCodeOutline` · generic
    `mdiFileOutline`. Error and rejected rows show `mdiFileAlertOutline` in error ink. Pure-logic module with a node
    spec. Rejected: vendor marks (Word/Excel/PDF box — brand ties, mixed styles); four categories (data files read
    as "document").
20. **`upload(file, { signal, onProgress, id })`; `onProgress(fraction 0–1)`.** The "1.2 MB of 9.1 MB" line is
    fraction × `file.size` (XHR's `total` counts multipart overhead). Whenever `upload` is set, every `local` entry
    with a `file` — picked or set programmatically — is queued; unsetting `upload` returns `queued` entries to
    `local`, in-flight ones finish.
21. **`disabled` makes the zone and row actions inert; in-flight uploads continue.**
22. **The file list sits below the zone in both layouts, single or multiple.** One row design; a compact single
    field grows by one row and a new pick replaces it. Rejected: the file inline in a single compact row (a second
    rendering of the row — truncation, actions, progress — inside the field box).
23. **Canonical term: file entry** (type `CFileUploadEntry`). Rejected: upload (collides with the act, the
    `upload` function and the tag), attachment (implies a message; wrong for `local` / dataset use).
24. **(Feedback 2026-10-12) The same file is never added twice.** A new reject reason `duplicate`
    (`rejectedDuplicate`, "Already added"), checked after type and size and before count, so a duplicate takes no
    room. Matched on name + size + `lastModified` against a held `File` — the dialog hands back a new object for
    the same file — and on name + size against a server entry, which has no `lastModified`. Also within one add,
    and without `multiple` (re-picking the one file is refused, not re-sent; retry covers a failed one).
25. **(Feedback 2026-10-12) Rejected rows clear on the next change to the list** — an add, a user removal, or a
    value set from outside (a form reset) — not only on the next add. The v-model echo (a proxy of the emitted
    array, matched with `toRaw`) does not count. Reported as "removing the extra files does not get rid of the
    error message"; the accept canon's "Last refused" line had the same staleness and now clears on `change`.
26. **(Feedback 2026-10-12) Manual start is a `manual` prop + a `startUploads()` method** — reverses the rejection
    in decision 5 and the "assign `upload` later" recipe of decision 13. Reported: the manual-start canon needed
    its button only once; every file added after the first press uploaded by itself, because a set upload
    function queues each add. Under `manual` added files stay `local` with an upload function present;
    `startUploads()` queues the `local` entries held at the call (tracking server-set `local` entries with a
    `File`, as adopting does), pumps, and emits the value once if it started any — like `CSelect.reset()`, a
    method that emits. Files added after it wait for the next call; a retry still queues at once; without an
    upload function the call does nothing; turning `manual` off queues held files silently, as assigning
    `upload` does. Rejected: the consumer writing `status: 'queued'` (a consumer-written status, against the
    component's state winning); the canon unsetting `upload` once the run drains (files added mid-run still
    join it). Assigning `upload` late keeps its meaning without `manual`.

## Public API (from the decisions)
```ts
export type CFileUploadStatus = 'done' | 'error' | 'local' | 'queued' | 'uploading';
export interface CFileUploadEntry {
  id: string; name: string; size: number; type?: string;
  file?: File; status: CFileUploadStatus; result?: unknown; error?: string;
}
export interface CFileUploadContext { id: string; onProgress: (fraction: number) => void; signal: AbortSignal }
export type CFileUploadFunction = (file: File, context: CFileUploadContext) => Promise<unknown>;
export type CFileUploadRejectReason = 'count' | 'folder' | 'size' | 'type';
export interface CFileUploadRejection { file: File; reason: CFileUploadRejectReason }
export interface CFileUploadTexts { … }   // keys below
```
- Props: `value` (`CFileUploadEntry[]`, property), `upload` (property), `accept`, `max-size`, `max-files`,
  `multiple`, `label`, `required`, `hint`, `error-message`, `valid`, `disabled`; defaultable `compact` (false),
  `size` ('default'), `hide-details` (false), `texts` ({}).
- Events: `change` / `update:value` / `input` (value), `reject` (`CFileUploadRejection[]`).
- Custom state: `drag-over`. Parts: `root`, `label`, `drop-zone`, `list`, `entry`, `rejected`, `progress`,
  `message`. No slots.
- Texts keys (function-valued where interpolated, English inline-ternary plurals as in CTreeSelect):
  drag prompt + choose link (single / multiple wording), touch prompt, compact button + "or drop … here", drop-active
  prompt; `waiting`, `progress(loaded, total, percent)`, `uploadFailed`; `remove(name)`, `cancel(name)`,
  `retry(name)`, `dismiss(name)`; `rejectedType`, `rejectedSize(max)`, `rejectedCount(max)`, `rejectedFolder`;
  announcements `added(count)`, `uploaded(name)`, `failed(name, error)`, `rejected(name, reason)`.

## Docs to write (after approval)
**CONTEXT.md** — new `### File upload` section (after Colour picker):
- **File upload** (`c-file-upload`): a **value control** holding a list of **file entries** — files the user adds
  by dropping them on it or choosing them through its **drop zone**, and server files the consumer supplies. It
  never sends a byte itself: with an **upload function** it uploads each added file through it, showing progress;
  without one it only holds the files. _Avoid_: Uploader, file input (the native `<input type="file">`), dropzone.
- **File entry**: one file a file upload holds — picked by the user or a server file the consumer supplies — with
  its name, size, **upload status** and, once uploaded, the upload function's result. _Avoid_: Item (an `items`
  entry), attachment, upload, file (the browser's `File`, which an entry may carry).
- **Upload status**: where a file entry stands — `local` (held, no upload function), `queued` (waiting for one of
  three slots), `uploading`, `done` (sent, or a server file), `error` (the upload function rejected). _Avoid_:
  State (custom states are host-level), pending (the **pending value**).
- **Upload function**: the consumer's `upload` property, called once per file with a progress callback and an
  abort signal; it owns the transport, the file upload owns the queue. _Avoid_: Handler, custom request, action.
- **Drop zone**: the file upload's dashed target and button that opens the file dialog — a large zone, or a
  control-height row under `compact`. The whole component accepts a drop; the zone shows it. _Avoid_: Dropzone,
  drop area, drag area.
- **Rejected file**: a file refused for breaking `accept`, `max-size` or `max-files`, or for being a folder: shown
  as a dismissible row with its reason until the next add, announced, reported by `reject` — never a file entry.
  _Avoid_: Invalid file (validity is the consumer's judgement), error entry (an entry whose upload failed).
- Amend **Multiple**: on `c-file-upload` the value is always an array; `multiple` governs how many files a pick
  adds (without it a pick replaces the one entry).
- Amend **Value control**: add the file upload to the list; it also emits once when an upload settles.
- Amend **Control height**: the `compact` drop zone joins the 52 / 36px steps.
- Amend **Custom state** list: the file upload's `drag-over`.
- Flagged ambiguity **"Upload"**: (a) the act, (b) the `upload` function, (c) the component. Say "uploading",
  **upload function**, **file upload**; an element of the value is a **file entry**, never "an upload".

**ADR-0071** `c-file-upload-drives-a-consumer-upload-function-over-file-entries.md` (Proposed until shipped):
transport is the consumer's (`upload(file, { signal, onProgress, id })`), the queue the component's (3 in flight,
cancel, retry); the value is a list of id-keyed file entries carrying status and result, emitted on add, remove
and settle; not form-associated (files reach a server only through the upload function or consumer-built
`FormData`). Considered: component-run XHR (`action` / `headers`), consumer-written progress, `File[]` value,
first form-associated component. Consequence: the value-control contract gains a non-interaction emission (settle).

## Implementation
Follow the c-color-picker / c-number-field file set (agent survey, commits e07c07a4, 45179c75).
1. **Pure logic** `src/components/c-file-upload/files.ts` + `files.node.spec.ts`: `matchesAccept(file, accept)`
   (extensions case-insensitive, `type/*`, exact MIME; empty `type` → extension), `formatBytes(n, lang)` (decimal
   SI, `Intl` unit cache in the `numbers.ts` style, `long` under 1 kB), `fileCategory(type, name)` → icon,
   `splitName(name)` → stem / extension (`.tar.gz` aware), id generator.
2. **`CFileUpload.vue`**: `defineElement` SFC with `FormLabel` (group label, `role="group"`), `FieldMessage`
   (`part="message"`), hidden `<input type="file">` (`accept`, `multiple`) behind a native `<button>` zone;
   drag handlers on the root (`dragenter`/`dragleave` depth counter, `dragover` `preventDefault` only when the
   drag carries `Files`), folder detection via `webkitGetAsEntry()`; queue runner keyed by `id` (Map of
   `{ controller, progress }`, ≤3 in flight, watch on `upload` to adopt `local` entries); `emitModelChange` from
   add / remove / settle handlers only; `useHostStates` → `drag-over`; `useStatusAnnouncer` with a message queue
   joined at fire time; `useAppDefault` for the defaultables; tv() slots, semantic tokens only, the zone's dashed
   edge on the `divider` ink (load-bearing hairline, ADR-0042), error ink under `valid=false`; rows via
   `c-icon` + `c-icon-button` (x-small text, like CTag); hairline `role="progressbar"` with `aria-label` = name.
3. **`usage.md`**: description paragraph; upload-function recipe (XHR with progress, fetch without); decimal
   `max-size`; don't rethrow raw server errors; building `FormData` in `local` mode; manual start by assigning
   `upload`; server files need an `id`.
4. **Registration**: `src/index.ts` (import, `export type {…}`, `components` after `c-icon`/`c-icon-button`,
   `tailwindVariantTags`), `index.node.spec.ts` order assertion, `test/conformance/kinds.ts` `VALUE_RECIPES`
   (`interact`: `userEvent.upload` on the inner input — Vitest 5 has it; `programmatic`: one server entry),
   `appDefaults.spec.ts` allow-list, `api.entry.snapshot.json`; regenerate `tag-name-map.ts`
   (`pnpm ui docs:manifest`) and the React wrapper (`pnpm --filter @cscfi/csc-ui-react build`).
5. **Behaviour spec** `CFileUpload.spec.ts`: pick (single replaces, multiple appends), drop (synthetic `DragEvent`
   with a `DataTransfer`) on zone and on a row, accept / size / count / folder rejections + `reject` detail +
   rejected rows clearing on the next add, queue cap 3, progress → status line + progressbar values, settle
   emissions (one per settle, none per tick), cancel aborts the signal, retry, remove focus order, id round trip
   through a cloned value keeps progress, programmatic removal aborts silently, late `upload` adopts `local`,
   `disabled` keeps in-flight uploads, error-message rule (Error / TypeError / non-Error), announcements,
   `:state(drag-over)`. Visual baselines per mode: large empty, large with rows (each status + rejected row),
   compact default + small, drag-over, invalid, disabled.
6. **Docs canons** `packages/csc-ui-documentation/app/examples/c-file-upload/` in all four flavours: basic
   (local), upload-with-progress (simulated upload function), accept-and-limits, compact, server-files (edit
   form), manual-start, texts (every key, per memory).
7. **Process**: CONTEXT.md + ADR-0071 (above), `.changeset/file-upload.md` (minor, both packages), copy this
   plan to `_plan/c-file-upload.md`.

## Verification
- `pnpm ui test` filtered to `c-file-upload` + `files.node.spec.ts`, then the conformance suites (value controls,
  root part, projected ink, mode scope) — one spec file per run in the devcontainer (Chromium OOM memory).
- `pnpm ui test:update` for the new baselines; review the PNGs in both modes.
- `pnpm build` → `pnpm --filter csc-ui-documentation test` (example smoke) → `pnpm lint` (guards, example parity)
  → the CI `type-check` step (memory: `pnpm build` skips spec types).
- Manual: real drag from the OS file manager in the docs dev server (`pnpm dev`), a phone-width touch layout,
  screen-reader pass on announcements and per-file action names, Firefox ESR headless smoke of drop + dialog.
