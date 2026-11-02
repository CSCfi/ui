/**
 * Split a form control's fallthrough attributes: its ARIA attributes describe
 * the control, so they belong on the native element inside (an `aria-label`
 * on `<c-checkbox>` names the checkbox, not the wrapper around it); the rest
 * stay on the root, where Vue's own fallthrough put them. Use with
 * `defineOptions({ inheritAttrs: false })`.
 */
import { computed, useAttrs } from 'vue';

export const useControlAttrs = () => {
  const attrs = useAttrs();

  const pick = (aria: boolean) =>
    computed(() =>
      Object.fromEntries(
        Object.entries(attrs).filter(
          ([name]) => name.startsWith('aria-') === aria,
        ),
      ),
    );

  return { controlAttrs: pick(true), rootAttrs: pick(false) };
};
