import Vue, { VNode } from 'vue';
import { DirectiveBinding } from 'vue/types/options';

const wm = new WeakMap();

const resolve = (path: string, obj: VNode): object => {
  // @ts-ignore
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr as keyof VNode] : null;
  }, obj || self);
};

export const vControl = {
  bind(el: HTMLInputElement, binding: DirectiveBinding, vnode: VNode) {
    const inputHandler = (event: CustomEvent) => {
      if (!binding.expression) return;

      const parts = ['context', ...binding.expression.split('.')];
      const value = parts.pop();

      Vue.set(resolve(parts.join('.'), vnode), `${value}`, event.detail);
    };

    wm.set(el, inputHandler);

    el.value = binding.value;

    // @ts-ignore
    el.addEventListener('changeValue', inputHandler);
  },

  componentUpdated(el: HTMLInputElement, binding: DirectiveBinding) {
    el.value = binding.value;
  },

  unbind(el: HTMLInputElement) {
    const inputHandler = wm.get(el);

    el.removeEventListener('changeValue', inputHandler);
  },
};
