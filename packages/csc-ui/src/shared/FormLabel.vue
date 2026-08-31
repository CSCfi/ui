<template>
  <component
    :is="tag"
    :id="labelId || undefined"
    :class="ui.root()"
    :for="htmlFor || undefined"
    :part
  >
    <span v-if="label">{{ label }}</span>

    <span v-show="!label"><slot /></span>

    <span v-if="required" :class="ui.required()" aria-hidden="true">
      &nbsp;*
    </span>
  </component>
</template>

<script setup lang="ts">
/**
 * Internal shared label anatomy: the `label` prop text (or the
 * host component's default-slot fallback passed through our slot) plus the
 * required asterisk. NOT a registered custom element — imported into a host
 * component's template and rendered inside its shadow root, so the stamped
 * `part` participates in that component's `::part()` contract.
 *
 * Association is the host's job: a group label gets `label-id` and the host
 * points `aria-labelledby` at it; a field label gets `html-for` (or the host
 * wraps the control in its own `<label>`). Per-component typography rides in
 * via the fallthrough `class`; only the asterisk colour is owned here.
 *
 * No `<style>` block on purpose: a non-element SFC has no shadow root of its
 * own to adopt a per-type sheet into. Semantic-token utilities only
 * (CI-guarded).
 */
import { tv } from 'tailwind-variants';

const formLabel = tv({
  slots: {
    required: 'text-error',
    root: '',
  },
});

interface FormLabelProps {
  /** `for` attribute for field-label mode (associates a single control). */
  htmlFor?: string;
  /** Visible label text; when empty the default slot renders instead. */
  label?: string;
  /** Id stamped on the element for the host's `aria-labelledby` (group-label mode). */
  labelId?: string;
  /** Part name stamped on the element (`label` unless the host reserves it). */
  part?: string;
  /** Render the required asterisk. */
  required?: boolean;
  /** Element to render; `label` for real labels, `span`/`div` inside an outer `<label>`. */
  tag?: 'div' | 'label' | 'span';
}

withDefaults(defineProps<FormLabelProps>(), {
  htmlFor: '',
  label: '',
  labelId: '',
  part: 'label',
  required: false,
  tag: 'label',
});

const ui = formLabel();
</script>
