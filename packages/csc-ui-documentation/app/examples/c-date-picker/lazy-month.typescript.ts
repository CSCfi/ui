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

const picker = document.querySelector('c-date-picker')!;

// `change:month` names the displayed month — on open too — so the booked
// days load one month at a time.
picker.addEventListener('change:month', async (event) => {
  picker.disabledDates = await fetchBooked(event.detail);
});

picker.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
