// @ts-nocheck — documentation code sample; shown as text, never compiled here
interface Topic {
  id: string;
  label: string;
  active: boolean;
}

const createTopics = (): Topic[] => [
  { id: 'biosciences', label: 'Biosciences', active: false },
  { id: 'chemistry', label: 'Chemistry', active: false },
  { id: 'physics', label: 'Physics', active: false },
];

let topics = createTopics();

const container = document.createElement('div');
container.className = 'example-grid';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tags = document.createElement('c-tags');

const render = () => {
  tags.replaceChildren();

  for (const topic of topics) {
    const tag = document.createElement('c-tag');
    tag.closeable = true;
    tag.active = topic.active;
    tag.textContent = topic.label;

    tag.addEventListener('click', () => {
      topic.active = !topic.active;
      tag.active = topic.active;
    });

    tag.addEventListener('close', () => {
      topics = topics.filter((t) => t.id !== topic.id);
      render();
    });

    tags.append(tag);
  }
};

const resetButton = document.createElement('c-button');
resetButton.textContent = 'Reset topics';
resetButton.addEventListener('click', () => {
  topics = createTopics();
  render();
});

const actions = document.createElement('div');
actions.append(resetButton);

render();

container.append(tags, actions);
document.body.append(container);
