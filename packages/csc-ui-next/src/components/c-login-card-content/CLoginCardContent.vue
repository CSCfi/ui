<template>
  <article>
    <slot />
  </article>
</template>

<style>
:host {
  display: block;
}

article {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
