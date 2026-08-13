// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CTag, CTags } from '@cscfi/csc-ui-react';

const createTopics = () => [
  { id: 'biosciences', label: 'Biosciences', active: false },
  { id: 'chemistry', label: 'Chemistry', active: false },
  { id: 'physics', label: 'Physics', active: false },
];

export const Closeable = () => {
  const [topics, setTopics] = useState(createTopics);

  const toggle = (id: string) =>
    setTopics((current) =>
      current.map((topic) =>
        topic.id === id ? { ...topic, active: !topic.active } : topic,
      ),
    );

  const remove = (id: string) =>
    setTopics((current) => current.filter((topic) => topic.id !== id));

  const reset = () => setTopics(createTopics());

  return (
    <div className="example-grid">
      <CTags>
        {topics.map((topic) => (
          <CTag
            key={topic.id}
            active={topic.active}
            closeable
            onClick={() => toggle(topic.id)}
            onClose={() => remove(topic.id)}
          >
            {topic.label}
          </CTag>
        ))}
      </CTags>

      <div>
        <CButton onClick={reset}>Reset topics</CButton>
      </div>
    </div>
  );
};
