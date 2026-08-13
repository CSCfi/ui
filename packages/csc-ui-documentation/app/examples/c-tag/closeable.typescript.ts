const tags = document.querySelector('c-tags')!;

const topics = Array.from(document.querySelectorAll('c-tag'));

topics.forEach((tag) => {
  tag.addEventListener('click', () => {
    tag.active = !tag.active;
  });

  tag.addEventListener('close', () => {
    tag.remove();
  });
});

document.querySelector('c-button')!.addEventListener('click', () => {
  topics.forEach((tag) => (tag.active = false));

  tags.replaceChildren(...topics);
});
