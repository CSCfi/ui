const tags = document.querySelector('c-tags')!;

const topics = Array.from(document.querySelectorAll('c-tag'));

topics.forEach((tag) => {
  tag.addEventListener('close', () => {
    tag.remove();
  });
});

document.querySelector('c-button')!.addEventListener('click', () => {
  tags.replaceChildren(...topics);
});
