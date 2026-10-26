A field the user adds files to by dropping them on it or choosing them from a file dialog — and, given an upload function, the place each file's upload shows its progress.

## Value

The value is a list of file entries — always a list, even in a field that
takes one file. Each entry has an `id`, the file's `name`, `size` and
`type`, and a `status`:

| `status`    | The entry                                                |
| ----------- | -------------------------------------------------------- |
| `local`     | holds a file not yet sent — see Uploading later          |
| `queued`    | waits for a free upload slot — at most three run at once |
| `uploading` | is being sent                                            |
| `done`      | was sent, or is a file already on the server             |
| `error`     | failed; its `error` holds the text the row shows         |

A file the user added carries the browser `File` as `file`; once uploaded,
`result` holds what the upload function resolved to. Bind the list with
`v-model` — an array, so it is a DOM property — or listen for `change`:

```vue
<c-file-upload v-model="files" label="Attachments" multiple />
```

The value events fire when the user adds, removes or retries a file, when
`startUploads()` starts files, and once when each upload finishes, done or
failed — never for progress, and never when `value` is set. Each event carries a new list of new entries.

Without `multiple` the field holds one file, and choosing another replaces
it.

## Uploading

The field never sends a byte itself. Set `upload` to a function that sends
one file, and the field calls it for every added file as soon as it is
added:

```js
picker.upload = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status < 300
        ? resolve(JSON.parse(xhr.response))
        : reject(new Error('The server refused the file'));
    xhr.onerror = () => reject(new Error('Network error'));
    signal.addEventListener('abort', () => xhr.abort());
    xhr.open('POST', '/api/files');
    xhr.send(file);
  });
```

`onProgress` takes a fraction from 0 to 1; until its first call the row's
bar is indeterminate, so `fetch` — which reports no upload progress — works
too. The `signal` aborts when the user cancels, removes the entry, or the
field leaves the page. What the promise resolves to becomes the entry's
`result`, typically the server's id for the file.

When the promise rejects with an `Error`, its `message` is the text the row
shows, so throw the words the user should read — `new Error('The file
exceeds your quota')`. Any other rejection, and the browser's own network
errors, show "Upload failed". Do not rethrow raw server responses.

A failed row offers a retry; a queued or uploading one, a cancel.

## Uploading later

A `manual` field holds added files as `local` even with an upload function,
until `startUploads()` queues them — so a form can upload only when the user
asks:

```vue
<c-file-upload
  ref="field"
  v-model="files"
  :upload="send"
  label="Attachments"
  manual
  multiple
/>
<c-button @click="field?.startUploads()">Upload</c-button>
```

The call starts the files the field holds at that moment and fires the value
events once. Files added after it wait as `local` for the next call; a failed
row's retry still sends its file at once. Without an upload function the call
does nothing.

Without `manual`, there is no waiting: an upload function assigned later
queues every `local` entry at once, and so every file added after it.

Or leave `upload` unset and send the files with the rest of the form. The
field takes no part in a native `<form>` submission; build the `FormData`
from the value:

```js
const body = new FormData();

for (const entry of files) if (entry.file) body.append('files', entry.file);
```

## Files already on the server

To show files the user uploaded earlier, set them as entries without a
`file`, with `status: 'done'` and the server's own `id`:

```js
picker.value = [
  { id: 'f_12', name: 'contract.pdf', size: 120_400, status: 'done' },
];
```

Removing one only takes it out of the value. Deleting it on the server, if
it should be, is the consumer's job — on submit, or by comparing the lists.

Keep each entry's `id` when the value passes through your own state: the
field matches entries by `id`, so a list rebuilt without it loses the
progress and the cancel of the files still uploading.

## Accepted files

`accept` takes the native syntax — extensions and media types,
`.pdf,image/*`. It filters the file dialog, and the field checks a dropped
file against it too, since a drop bypasses the dialog. `max-size` caps a
file's size in bytes, and `max-files` the number of entries a `multiple`
field holds:

```vue
<c-file-upload
  v-model="files"
  accept=".pdf,image/*"
  hint="PDF or images, up to 10 MB each"
  label="Receipts"
  max-files="5"
  max-size="10000000"
  multiple
/>
```

Sizes are shown in decimal units — `1 MB` is 1,000,000 bytes, as on most
phones and Macs — so write `max-size` in decimal bytes. Name the accepted
types and limits in the `hint`; the field does not generate that text.

The field never holds the same file twice: a file already in the list —
picked again from the same folder, or matching a server file's name and
size — is refused too, and so is the one file of a field without `multiple`
when it is picked again.

A refused file never joins the value. It shows as a rejected row with the
reason, and the `reject` event lists every refused file with its reason:
`type`, `size`, `duplicate`, `count` or `folder`. The rows describe the
latest add, so the next change to the list — another add, a removal, or a
value set from outside — clears them, and the user can close each one.

## Compact

`compact` shows the drop zone as a row at the shared control height — a
"Choose files" button and a drop prompt — so the field lines up with the
fields beside it. `size="small"` makes the row 36px tall:

```vue
<c-file-upload v-model="cv" compact label="CV" />
```

The file list sits under the drop zone in both layouts.

## Dropping

The whole field takes a drop, not only the drop zone, so a drop that just
misses the zone still lands. While files are dragged over it, the zone
highlights and the host exposes the `drag-over` custom state.

## Accessibility

Dragging is a pointer-only shortcut: the drop zone is a button that opens
the file dialog, and on a touch screen its prompt reads "Choose files".
Each row's buttons are named after the file — "Remove report.pdf", "Cancel
upload of report.pdf". A polite announcement reports files added, each
finished or failed upload and each rejected file; progress is never
announced, but each uploading row's progress bar can be read on demand.

## Texts

Every text the field shows or announces is in `texts`, merged over the
English defaults; set it per field or app-wide with `applyDefaults`. File
sizes follow the page's `lang` (`1,2 Mt` under `lang="fi"`) and need no
texts.
