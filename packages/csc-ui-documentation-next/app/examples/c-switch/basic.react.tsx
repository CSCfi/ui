// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useEffect, useRef, useState } from 'react';
import '@cscfi/csc-ui-next';

export const Basic = () => {
  const [enabled, setEnabled] = useState(false);
  const switchRef = useRef<HTMLElement & { value: boolean }>(null);

  useEffect(() => {
    const element = switchRef.current;
    if (!element) return;

    element.value = enabled;

    const onChange = (event: Event) =>
      setEnabled((event as CustomEvent<boolean>).detail);

    element.addEventListener('changeValue', onChange);
    return () => element.removeEventListener('changeValue', onChange);
  }, [enabled]);

  return (
    <div>
      <c-switch ref={switchRef}>Notifications</c-switch>
      <span>Value: {String(enabled)}</span>
    </div>
  );
};
