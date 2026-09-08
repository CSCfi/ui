// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CTag, CTags } from '@cscfi/csc-ui-react';

const createTopics = () => [
  { id: 'biosciences', label: 'Biosciences' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'physics', label: 'Physics' },
];

export const Closeable = () => {
  const [topics, setTopics] = useState(createTopics);

  const remove = (id: string) =>
    setTopics((current) => current.filter((topic) => topic.id !== id));

  const reset = () => setTopics(createTopics());

  return (
    <div className="example-grid">
      <CTags>
        {topics.map((topic) => (
          <CTag key={topic.id} closeable onClose={() => remove(topic.id)}>
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
