export const getScrollParent = (element): Promise<HTMLElement> => {
  return new Promise((resolve) => {
    if (!element) {
      resolve(undefined);
    }

    let parent = element.parentNode;

    while (parent) {
      if (parent.shadowRoot === undefined) {
        parent = parent.host;
      } else {
        const { overflow, overflowX } = window.getComputedStyle(parent);

        if (
          overflowX !== 'scroll' &&
          overflow.split(' ').every((o) => o === 'auto' || o === 'scroll')
        ) {
          resolve(parent);
        }

        parent = parent.parentNode;
      }
    }

    resolve(document.documentElement);
  });
};
