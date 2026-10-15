# 71. c-file-upload drives a consumer upload function over file entries

Date: 2026-10-12

## Status

Accepted

## Context

The todo asks for an upload component: files added by clicking or dropping
on a drop zone, progress, file sizes, and a configurable list of accepted
types. Neither the Stencil line nor 4.x ever had one. Showing progress means
something has to run the request, and every consumer sends files
differently — multipart to its own API, presigned object-storage URLs,
chunked or resumable protocols — each with its own auth. No csc-ui component
takes part in native `<form>` submission (`CSelect.vue`, ADR-0023).

## Decision

- **Transport is the consumer's, the queue is the component's.** The
  `upload` property is an **upload function**
  `(file, { signal, onProgress, id }) => Promise<result>` that
  `c-file-upload` calls once per added file. The component starts uploads as
  files are added, at most three in flight, and owns the status, the
  progress display, cancel (by aborting `signal`) and retry. `onProgress`
  takes a fraction from 0 to 1. Without an upload function the component
  only holds the files (`local`); assigning one later queues them.
- **A manual start is a mode and a method.** Under `manual` added files stay
  `local` even with an upload function, until the consumer calls
  `startUploads()`, which queues the `local` entries held at that moment;
  files added after it wait for the next call. A retry still sends its file
  at once. Assigning the function late is no manual start: from then on
  every added file uploads by itself.
- **The value is a list of file entries.** Each **file entry** carries a
  required `id`, `name`, `size`, `type`, the browser `File` when there is
  one, an **upload status** (`local | queued | uploading | done | error`),
  the upload function's `result` and the `error` text shown. The value is
  always an array; `multiple` only decides whether a pick adds files or
  replaces the one entry. A server file the consumer supplies is an entry
  with no `File` and status `done`.
- **Internal upload state is keyed by `id`.** The component generates ids
  for files it picks. For those ids its own status and progress win over a
  value set back, so a cloned or stale snapshot never rewinds an upload;
  removing a known id from `value` in code aborts that upload silently.
- **Emissions.** `change`, `update:value` and `input` fire when the user
  adds, removes or retries a file, when `startUploads()` starts any, and
  once when each upload settles (done or error) — never on a progress tick. Each emission is a new array of new
  entries. A field taken out of the page aborts its uploads.
- **Rejected files are not entries.** A file that breaks `accept`,
  `max-size` or `max-files`, is a folder, or is already held, shows as a
  dismissible row with its reason, is announced, and is reported by a
  `reject` event. A held file is matched on name, size and last-modified
  time; a server file, which has no last-modified time, on name and size.
  The rows describe the latest add and clear on the next change to the
  list.
- **Not form-associated.** Files reach a server through the upload function
  or through `FormData` the consumer builds from the value.

## Considered options

- **The component runs the request** (`action`, `headers`,
  `with-credentials`): turnkey, but the library would own auth, CSRF,
  presigned URLs, chunking and retries — an open-ended prop list for a UI
  library.
- **Manual start by assigning the upload function late**, with no `manual`
  mode: no new API, but only the first press is manual — files added once the
  function is set upload by themselves.
- **Manual start by writing `status: 'queued'` into the value:** declarative,
  no element ref, but `queued` would become a status the consumer writes, an
  exception to the component's state winning over a value set back.
- **The consumer uploads and writes progress back onto the entries:** the
  most neutral option, but every consumer would do per-file bookkeeping
  through a custom-element property.
- **A `File[]` value** with status on a side channel: cannot show files
  already on the server, and keeps `result` outside the model.
- **`multiple` switching the value between `Entry | null` and `Entry[]`:**
  matches the glossary's **Multiple** exactly, but consumers get a union
  and server files two spellings.
- **The first form-associated component:** a native form would submit the
  files but not the text fields beside them. Form association stays a
  library-wide decision.

## Consequences

- The value-control contract gains emissions that are not a user
  interaction: an upload settling, and `startUploads()` starting files. Setting `value` itself stays silent; only
  a `local` entry with a `File`, set while an upload function is present,
  starts an upload whose settle emits later.
- A consumer who keeps the value outside Vue's v-model (React state, a
  store) must keep each entry's `id`; one that drops it loses progress and
  cancel for that file.
- A consumer who wants files in a native form submission builds the
  `FormData` itself; the usage doc shows how.
