The CSC logo without its tagline, drawn as an inline SVG in the colours of the
current theme mode.

Set its width in pixels with `width` (60 by default); the height follows the
logo's proportions. It typically sits at the start of a `c-toolbar`.

## Theme modes

In light mode the wordmark is dark grey and the two marks keep the fixed CSC
brand teal and magenta; re-seeding a family with `applyTheme` never recolours
them. In dark mode the whole logo turns white. To show the white logo on a
dark or brand-coloured backdrop in a light page, make the backdrop a dark
mode scope with `data-theme="dark"`.

## Accessibility

Assistive technology names the logo by the SVG's built-in `<title>`,
"CSC_logo_no_tagline", and no prop changes it. When the logo is the content
of a link to the home page, give the link its own name, for example
`aria-label="CSC home"` on the `<a>`, so the title is not read as the link
text.

## Customization

`::part(root)` is the `<svg>` element, a block with a small top margin;
adjust its spacing there. Leave its colours alone: it is a brand mark.
