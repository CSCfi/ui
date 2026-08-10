<template>
  <div
    :aria-labelledby="label ? labelId : undefined"
    :class="ui.root()"
    :role="label ? 'group' : undefined"
    part="root"
  >
    <form-label
      v-if="label"
      :class="ui.label()"
      :label
      :label-id
      :required
      part="label"
    />

    <div :class="ui.items()" part="items">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
export interface CTagsProps {
  /**
   * Label of the tag group, shown above the tags
   *
   * @freeform
   */
  label?: string;
  /**
   * Set as required — shows the required marker on the label
   */
  required?: boolean;
  /**
   * Size of the tags
   *
   * @seeded from csc-ui — verify
   */
  size?: CTagsSize;
}

/**
 * Size propagated to every slotted `<c-tag>`. `small` renders compact tags;
 * omitting the attribute leaves the tags at their default size.
 */
export type CTagsSize = 'default' | 'small';
</script>

<script setup lang="ts">
/**
 * @slot default - Default slot for the c-tag elements
 *
 * @csspart root - The wrapper stacking the group label above the tags
 * @csspart label - The group label rendered above the tags
 * @csspart items - The wrapping row that lays out the slotted tags
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-tag
 */
import { tv } from 'tailwind-variants';
import { onMounted, toRefs, useHost, useId, watch } from 'vue';

import FormLabel from '../../shared/FormLabel.vue';

// We write to the host (child <c-tag> props) below — keep fallthrough attrs
// on the host element instead of the inner root div.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config. The `items` row
 * is the flex-wrap container for the slotted tags: the `<slot>` itself is
 * `display: contents`, so the distributed <c-tag> children lay out as the
 * row's flex items (gap included) even though they live in the light DOM.
 */
const tags = tv({
  slots: {
    items: 'flex flex-wrap items-center gap-1',
    label: 'text-left',
    root: 'flex flex-col gap-1',
  },
});

const props = withDefaults(defineProps<CTagsProps>(), {
  label: '',
  required: false,
  size: 'default',
});

const { size } = toRefs(props);

const ui = tags();

const host = useHost();

const autoId = useId();

const labelId = `${autoId}-label`;

// The original Stencil c-tags reaches into its slotted children on mount
// and propagates `size="small"` onto each <c-tag>. Mirror that here so a
// consumer can just write `<c-tags size="small">` without setting size on
// each tag. Re-run whenever `size` changes — covers cases where the prop
// is set dynamically after mount.
const propagate = () => {
  if (!host) return;

  const tagElements = host.querySelectorAll('c-tag');
  tagElements.forEach((tag) => {
    if (size.value === 'small') {
      (tag as HTMLElement).setAttribute('size', 'small');
    } else {
      (tag as HTMLElement).removeAttribute('size');
    }
  });
};

onMounted(propagate);
watch(size, propagate);
</script>

<!--
  Escape-hatch CSS: only the host display. The host needs a real
  box (the global sheet sets `:host{display:contents}`) so consumer sizing on
  <c-tags> keeps applying; the flex layout itself lives on the tv slots above.
-->
<style>
:host {
  display: block;
}
</style>
