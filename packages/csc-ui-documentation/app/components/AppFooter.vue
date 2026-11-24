<template>
  <!-- Plain links: /v3/ is a static archive the client router does not
       know, so it must load as a page of its own. -->
  <footer
    class="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-on-surface-muted"
  >
    <a class="underline" href="/v3/">
      3.x documentation (archived, unsupported)
    </a>

    <a class="underline" href="https://github.com/CSCfi/ui">Source on GitHub</a>

    <a class="underline" href="https://www.npmjs.com/package/@cscfi/csc-ui">
      @cscfi/csc-ui on npm
    </a>
  </footer>
</template>
