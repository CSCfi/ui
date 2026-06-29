---
name: vue-development
description: Vue development best practices. Use when creating or modifying vue components.
---

# Best Practices

## Props

- Always define component props the "Typescript way"
- Always provide type, and required/default where appropriate.
- Use `withDefaults` function if defaults are needed
- Never mutate props — emit events instead.

```
// Type-based props with defaults
type CMenuProps = {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  items: Item[];
};

const props = withDefaults(defineProps<CMenuProps>(), {
  variant: "primary",
  disabled: false,
});
```

## Template Refs

- Replace name-matched plain refs with useTemplateRef() for template references
- Use xxxRef (inputRef, containerRef, buttonRef, etc.) naming for template refs

```
import { useTemplateRef } from "vue";

const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
// "inputRef" parameter matches the ref="inputRef" attribute in template, not the variable name
```

## Unique ids

-Use SSR-stable unique ID generation (useId) for form elements and accessibility where an unique id is needed

```
import { useId } from "vue";

const id = useId();
```
