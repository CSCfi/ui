const eventHandler = (el: HTMLInputElement) => (event: CustomEvent) => {
  el.value = event?.detail ?? null;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

export const vControl = {
  mounted(el: any) {
    el.addEventListener('changeValue', eventHandler(el));
  },
  beforeUnmount(el: any) {
    el.removeEventListener('changeValue', eventHandler(el));
  },
};
