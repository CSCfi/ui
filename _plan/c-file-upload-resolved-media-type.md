# c-file-upload: carry the resolved media type on the file

## Context

`c-file-upload` resolves a file's media type with `mediaType()`
(`packages/csc-ui/src/components/c-file-upload/files.ts:101`): `File.type`,
else the `EXTENSION_TYPES` map, else `''`. It uses that only for `accept`
and the row icon. Entries keep the browser's raw type: `CFileUpload.vue:1196`
sets `type: file.type`, and `entry.file` and the upload function's argument
are the original `File`. Chrome on Windows reports `''` for .pptx/.odp when
no office suite is installed. The field accepts the file through the map,
but `formData.append('file', file)` then sends `application/octet-stream`.
MyCSC's server checks multer's `file.mimetype`, so it refuses the file, and
every retry fails the same way. The goal is that plain consumer code sends
the resolved type with no changes.

## Decisions (grilled 2026-11-16)

1. **Re-wrap accepted files only**, after `screenFiles`. Rejected files,
   including folders, keep the browser's `File` in the `reject` event.
2. **Only user adds re-wrap.** A `local` entry the consumer sets with its
   own `File`, which `enqueue`/`retryEntry` adopt, is left as given: the
   consumer owns its type.
3. **Every map entry is stamped**, including unregistered `x-*` guesses
   (`.py`, `.r`, `.ipynb`, `.sh`). Rule: the type `accept` judged the file
   by is the type the consumer gets. The changeset says so.
4. A non-empty browser type always wins (no re-wrap). An unknown extension
   with an empty type stays `''` (no re-wrap). Duplicate detection is
   unchanged: name, size and `lastModified`, with `lastModified` preserved.
5. No CONTEXT.md change. "File entry" doesn't list fields, so no term
   changes, and CONTEXT.md already holds uncommitted c-status hunks. Say
   "media type" in all prose, never "MIME type".

## Changes

### `files.ts`: a pure helper beside `mediaType`
```ts
/**
 * The file with its media type set: the same `File` when the browser
 * reported one or the extension implies none, else a new `File` over the
 * same bytes typed by its extension.
 */
export const withMediaType = (file: File): File => {
  const type = mediaType(file);

  return type === file.type
    ? file
    : new File([file], file.name, { lastModified: file.lastModified, type });
};
```
Update the module docblock's list of what the file holds. Node `File` is
global, so add a `withMediaType` block to `files.node.spec.ts`: an empty
`.pptx` gets typed and keeps `lastModified`, a typed file returns the same
object, an unknown extension returns the same object.

### `CFileUpload.vue`: `addFiles` (line ~1184)
In `accepted.map`, compute `const typed = withMediaType(file)`. Use
`typed` in `tracked.set(id, { controller: null, file: typed })` and in the
entry's `file` and `type` (`typed.type`). Keep `name: file.name,
size: file.size` from the original. Import `withMediaType` from `./files`.

The spec's `fileOf()` fakes `size` with `defineProperty`, and a re-wrapped
`File` has the real one-byte size. Reading `entry.size` from the original
keeps the existing size, progress and visual specs unchanged. In a real
browser the two sizes are equal.

Doc comments:
- `CFileUploadEntry.type`: `/** The media type: the browser's, or the one its extension implies when the browser reports none. */`
- `CFileUploadEntry.file`: mention that it carries that type.
- `CFileUploadRejection.file`: `The refused file, as the browser handed it.`

### `usage.md`: "Accepted files"
Add one or two sentences after the `accept` paragraph: when the browser
reports no media type (Chrome on Windows does for a `.pptx` without
Office), the field takes it from the extension. The entry's `type`, its
`file` and the file the upload function gets all carry it, so a server
that checks the type receives the right one.

### ADR-0071: inline amendment
Follow the `_Amended <date>_:` convention used in ADR-0014/0050/0052. Add
it under the "The value is a list of file entries" bullet: an added file
whose browser type is empty takes the type its extension implies. The
component re-wraps the `File` at add time, so `type`, `file` and the
upload function's file agree with what `accept` checked. A file the
consumer sets keeps its own type.

### `.changeset/file-upload-resolved-media-type.md`
`@cscfi/csc-ui` + `@cscfi/csc-ui-react`, **patch**. Draft:
> `c-file-upload` sends the media type it accepted a file by. When the
> browser reports none (a `.pptx` on Windows without Office), the entry's
> `type`, its `file` and the file the upload function receives now carry the
> type the extension implies instead of none, so the upload no longer goes
> out as `application/octet-stream`. This includes `.py`, `.r`, `.ipynb` and
> `.sh`, which now go out as their `text/x-*` / `application/x-*` types.

### `CFileUpload.spec.ts`: new `describe('media type')`
1. An empty-type `slides.pptx` under `accept` set to the pptx media type,
   with `controlledUpload()`: it is accepted. `entry.type`,
   `entry.file.type` and `calls[0].file.type` all equal the pptx type, and
   `entry.file.lastModified` equals the original's. Build a `FormData`
   from `entry.file` and serialize it with `await new Response(body).text()`
   (no network). Expect `Content-Type: <pptx type>` in the part header.
   This case fails before the fix (the required `Fix(` spec).
2. `data.csv` reported as `application/vnd.ms-excel` keeps that type, and
   `entry.file` is the picked `File` (`toBe`).
3. An empty-type `notes.xyz` stays `type: ''`, and `entry.file` is the
   picked `File`.
4. Re-picking the same empty-type `slides.pptx` (same name, size and
   `lastModified`, new object) is refused as `duplicate`.

## Commit

The working tree holds uncommitted c-status work, which also touches
CONTEXT.md, index.ts, the api snapshots and components.ts. Stage only these
paths:
- `packages/csc-ui/src/components/c-file-upload/{files.ts,files.node.spec.ts,CFileUpload.vue,CFileUpload.spec.ts,usage.md}`
- `docs/adr/0071-*.md`
- `.changeset/file-upload-resolved-media-type.md`

Check `.git/index.lock` first, and check the staged tree after staging.
Message: `Fix(c-file-upload): Send the media type the field accepted a file by`,
with a body giving the Windows/pptx cause, ending with
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Verification

From `packages/csc-ui`, one spec file per run (the devcontainer runs out of memory otherwise):
- `pnpm exec vitest run --project node src/components/c-file-upload/files.node.spec.ts`
- `pnpm exec vitest run --project browser src/components/c-file-upload/CFileUpload.spec.ts`.
  The new cases pass. Existing cases (sizes, duplicates, visuals) are unchanged.
- Fails-before check: temporarily revert the `addFiles` hunk and confirm
  case 1 fails, then restore it.
- `pnpm docs:manifest:strict`: the analyzer passes, and `git status` shows
  no new diff in `api.snapshot.json` / `api.entry.snapshot.json` /
  `csc-ui-react/src/components.ts` beyond the c-status changes already there.
- CI type-check: `pnpm run type-check`. If `vue-tsc --build` runs out of
  memory, check each tsconfig project in turn. Errors from the in-progress
  c-status work get reported, not fixed here.
- `pnpm lint` (oxlint, perfectionist sort, guards) and `pnpm format:check` on the touched files.
