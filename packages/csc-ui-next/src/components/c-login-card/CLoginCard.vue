<template>
  <article>
    <svg v-if="!!src" width="0" height="0">
      <defs>
        <clipPath id="cLoginClipPath" clipPathUnits="objectBoundingBox">
          <path :d="path" />
        </clipPath>
      </defs>
    </svg>

    <div
      ref="card"
      class="c-login-card"
      :class="{ 'c-login-card--mobile': isMobile }"
    >
      <div
        v-if="!!src"
        class="c-login-card__image"
        :class="{ 'c-login-card__image--overlay': !!overlay }"
        :style="imageStyle"
      />

      <div
        class="c-login-card__content"
        :class="{ 'c-login-card__content--no-image': !src }"
      >
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const props = defineProps({
  backgroundPosition: { type: String, default: 'bottom right' },
  mobileBreakpoint: { type: Number, default: 600 },
  overlay: { type: Boolean, default: false },
  overlayBlendMode: { type: String, default: 'multiply' },
  src: { type: String, default: '' },
});

const card = useTemplateRef<HTMLElement>('card');

// Two clip-path shapes for desktop and mobile layouts.
const PATHS = {
  desktop:
    'm0.234,0.914 c0.132,-0.026,0.286,-0.05,0.436,-0.163 c0.083,-0.063,0.152,-0.145,0.21,-0.329 c0.055,-0.172,0.072,-0.421,0.072,-0.421 h0.048 v1 h-1 v-0.057 c0,0,0.145,-0.012,0.234,-0.029',
  mobile:
    'm1,1 h-1 v-0.213 c0,0,0.209,-0.046,0.337,-0.109 c0.191,-0.096,0.413,-0.183,0.629,-0.608 c0.028,-0.055,0.034,-0.069,0.034,-0.069',
} as const;

const isMobile = ref(false);
const imageHeight = ref<string>('100%');
const path = ref<string>(PATHS.desktop);

const imageStyle = computed(() => ({
  backgroundImage: `url(${props.src})`,
  backgroundPosition: props.backgroundPosition,
  height: imageHeight.value,
  '--_c-login-card-overlay-mode': props.overlay ? props.overlayBlendMode : '',
}));

let resizeObserver: ResizeObserver | null = null;

const handleResize = (width: number) => {
  const mobile = width <= props.mobileBreakpoint;
  isMobile.value = mobile;
  imageHeight.value = mobile ? `${width * 0.3}px` : '100%';
  path.value = mobile ? PATHS.mobile : PATHS.desktop;
};

onMounted(() => {
  if (!card.value) return;
  resizeObserver = new ResizeObserver(([entry]) => {
    handleResize(entry.contentRect.width);
  });
  resizeObserver.observe(card.value);
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<style>
:host {
  --_c-login-card-background-color: var(
    --c-login-card-background-color,
    var(--c-white)
  );
  --_c-login-card-overlay-color: var(
    --c-login-card-overlay-color,
    var(--c-primary-600)
  );

  display: flex;
  background: var(--_c-login-card-background-color);
  border-radius: 6px;
}

article {
  width: 100%;
}

.c-login-card {
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.15) 0 10px 20px, rgba(0, 0, 0, 0.2) 0 5px 5px;
  display: flex;
  position: relative;
  width: 100%;
}

.c-login-card__image {
  background-size: cover;
  border-radius: 6px;
  /* The clip-path id is scoped to this shadow root — both the <svg> and
   * the div referencing it live in here. Stencil's shadow:false put it
   * in the consumer's light DOM. Either way works as long as both live
   * in the same tree. */
  clip-path: url('#cLoginClipPath');
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
}

.c-login-card__image--overlay {
  background-color: var(--_c-login-card-overlay-color);
  background-blend-mode: var(--_c-login-card-overlay-mode);
}

.c-login-card__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 72px;
  margin-bottom: 32px;
  max-width: 80%;
  width: 100%;
}

.c-login-card__content--no-image {
  max-width: 100%;
  margin-bottom: 0;
}

.c-login-card--mobile .c-login-card__content {
  max-width: 100%;
  padding: 40px;
}

.c-login-card--mobile .c-login-card__image {
  border-radius: 0 0 6px 6px;
  bottom: 0;
  top: auto;
  width: 100%;
}

/* Mobile-specific override of the (slotted) title's font size. ::slotted
 * is allowed at the end of a compound selector with a descendant
 * combinator before it; `.c-login-card--mobile` is the slot's ancestor
 * in this shadow root, so the rule applies only when we're in mobile
 * layout. */
.c-login-card--mobile ::slotted(c-login-card-title) {
  font-size: 32px;
  hyphens: auto;
}
</style>
