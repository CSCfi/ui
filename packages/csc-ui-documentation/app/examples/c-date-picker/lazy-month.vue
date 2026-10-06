<template>
  <div>
    <!-- `change:month` names the displayed month — on open too — so the
         booked days load one month at a time. -->
    <c-date-picker
      v-model="date"
      :disabled-dates="booked"
      hint="Booked days load as you browse"
      label="Booking"
      @change:month="onMonth"
    />

    <p>Value: {{ date ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

const booked = ref<string[]>([]);

const date = ref<null | string>(null);

const onMonth = async (event: CustomEvent<string>) => {
  booked.value = await fetchBooked(event.detail);
};
</script>
