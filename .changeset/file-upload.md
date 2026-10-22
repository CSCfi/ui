---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add c-file-upload: a field the user adds files to by dropping them on it or
choosing them from the file dialog, with each file's size and upload progress
in a list under the drop zone (ADR-0071).

- The value is a list of file entries — name, size, type, the browser `File`
  and a status — bound with `v-model`. Files already on the server can be
  listed as entries without a `File`.
- Set `upload` to a function that sends one file; the field calls it for each
  added file, three at a time, shows its progress, and offers cancel and retry.
  Without one, the field only holds the files. A `manual` field holds them
  until `startUploads()` is called, for a form that uploads on its own button.
- `accept`, `max-size` and `max-files` limit what the field takes, and a file
  already in the list is never added twice; a refused file is listed with its
  reason until the list next changes, and reported by the `reject` event.
- `compact` shows the drop zone as a row at the shared control height, to line
  up with the fields beside it.
