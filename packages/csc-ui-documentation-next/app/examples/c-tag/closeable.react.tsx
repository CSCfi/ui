// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTag, CTags } from '@cscfi/csc-ui-next-react';

export const Closeable = () => {
  const [topics, setTopics] = useState(['Biosciences', 'Chemistry', 'Physics']);

  const remove = (topic: string) => {
    setTopics((current) => current.filter((t) => t !== topic));
  };

  return (
    <div className="example-row">
      <CTags>
        {topics.map((topic) => (
          <CTag key={topic} closeable onClose={() => remove(topic)}>
            {topic}
          </CTag>
        ))}
      </CTags>
    </div>
  );
};
