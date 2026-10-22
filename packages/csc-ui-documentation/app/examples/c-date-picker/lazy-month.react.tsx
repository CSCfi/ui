import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

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
  const [date, setDate] = useState<null | string>(null);

  const [booked, setBooked] = useState<string[]>([]);

  return (
    <div>
      {/* `change:month` names the displayed month — on open too — so the
          booked days load one month at a time. */}
      <CDatePicker
        disabledDates={booked}
        hint="Booked days load as you browse"
        label="Booking"
        onChange={(event) => setDate(event.detail as null | string)}
        onChangeMonth={async (event) =>
          setBooked(await fetchBooked(event.detail as string))
        }
        value={date}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
