// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';

// A simulated booking API: the fully booked days of one month.
const fetchBooked = (month: string): Promise<string[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          ['03', '04', '11', '17', '18', '25'].map((d) => `${month}-${d}`),
        ),
      300,
    ),
  );

export const LazyMonth = () => {
  const [date, setDate] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);

  return (
    <div>
      {/* `change:month` names the displayed month — on open too — so the
          booked days load one month at a time. */}
      <CDatePicker
        value={date}
        disabledDates={booked}
        hint="Booked days load as you browse"
        label="Booking"
        onChange={(event) => setDate(event.detail as string | null)}
        onChangeMonth={async (event) =>
          setBooked(await fetchBooked(event.detail as string))
        }
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
