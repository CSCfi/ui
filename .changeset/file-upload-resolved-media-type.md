---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-file-upload` sends a file with the media type it accepted it by. When the
browser reports none, as Chrome on Windows does for a `.pptx` without Office,
the entry's `type`, its `file` and the file the upload function receives now
carry the type the extension implies, so the upload no longer goes out as
`application/octet-stream`. Untyped `.py`, `.r`, `.ipynb` and `.sh` files
likewise go out as `text/x-python`, `text/x-r`, `application/x-ipynb+json`
and `application/x-sh`.
