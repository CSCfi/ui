---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Ghost, text and outlined buttons and `c-alert` read at WCAG AA on popovers,
menus and the page canvas, not only on the page surface. Their tints were
see-through, so a dark popover or the light `c-main` canvas showed through
under the label (primary's ghost read 4.3:1 on a dark popover, a success
alert's heading 4.3:1 on the light canvas). Each tint is now the colour mixed
into the page surface, the same on any background, or, inside an alert's
message or a `c-data-table` banner or selected row, into that container at half
strength so a ghost or hovered button still stands out there. The accordion
header, breadcrumb links, file-upload's choose button and `c-table`'s mobile
rows follow.
