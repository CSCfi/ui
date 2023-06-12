export function createRipple(
  event: MouseEvent,
  element: HTMLElement,
  center = false,
) {
  let rippleElement: HTMLElement = element.querySelector('.md-ripple');

  if (!rippleElement) {
    rippleElement = document.createElement('div');
    rippleElement.classList.add('md-ripple');
    element.appendChild(rippleElement);
  }

  rippleElement.classList.remove('animate');

  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const rect = (event.target as HTMLElement).getBoundingClientRect();

  const d = Math.max(element.offsetWidth, element.offsetHeight);
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const top = y - d / 2 + 'px';
  const left = x - d / 2 + 'px';

  const centerPosition = {
    top: d === height ? '0px' : ((d - height) / 2) * -1 + 'px',
    left: d === width ? '0px' : ((d - width) / 2) * -1 + 'px',
  };

  rippleElement.style.width = d + 'px';
  rippleElement.style.height = d + 'px';
  rippleElement.style.top = center ? centerPosition.top : top;
  rippleElement.style.left = center ? centerPosition.left : left;

  rippleElement.classList.add('animate');

  setTimeout(() => {
    rippleElement.remove();
  }, 500);
}
