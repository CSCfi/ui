<template>
  <!-- The landing hero's live demo: a native form of form-associated fields
       (ADR-0084) whose c-buttons submit and reset it. Client-only (`.client`):
       the SSR compiler cannot compile v-model on a custom element, and the
       landing page reserves this card's box until it mounts. Plain scoped CSS
       instead of utilities, so tests/landing.spec.ts mounts it as the site
       shows it. -->
  <form
    class="landing-task-card"
    novalidate
    @reset="onReset"
    @submit.prevent="onSubmit"
  >
    <c-card>
      <c-card-title>
        Request compute resources

        <c-status slot="actions" :type="submitted ? 'success' : undefined">
          {{ submitted ? 'Submitted' : 'Draft' }}
        </c-status>
      </c-card-title>

      <c-card-content>
        <!-- Hosts are display: contents (one shared :host rule), so each
             field sits in a div the grid can place. -->
        <div class="landing-task-card-fields">
          <div class="landing-task-card-wide">
            <c-text-field
              ref="projectField"
              v-model="project"
              :invalid="showErrors && !project.trim()"
              error-message="Give the project a name"
              hint="Shown to everyone in the project"
              label="Project name"
              name="project"
              required
            />
          </div>

          <div>
            <c-select
              v-model="service"
              label="Service"
              name="service"
              placeholder="Choose a service"
            >
              <c-option name="Puhti" value="puhti">Puhti</c-option>

              <c-option name="Mahti" value="mahti">Mahti</c-option>

              <c-option name="LUMI" value="lumi">LUMI</c-option>
            </c-select>
          </div>

          <div>
            <c-number-field
              v-model="cpuHours"
              :min="0"
              :step="1000"
              label="CPU hours"
              name="cpu-hours"
            />
          </div>

          <div class="landing-task-card-wide">
            <c-date-picker
              v-model="period"
              label="Period"
              name="period"
              range
            />
          </div>
        </div>
      </c-card-content>

      <c-card-actions justify="end">
        <c-button appearance="ghost" type="reset">Reset</c-button>

        <c-button type="submit">Submit request</c-button>
      </c-card-actions>
    </c-card>

    <c-toasts ref="toasts" />
  </form>
</template>

<script setup lang="ts">
import type { CDatePickerRange } from '@cscfi/csc-ui';

import { ref, useTemplateRef } from 'vue';

const project = ref('');

const service = ref<null | string>('puhti');

const cpuHours = ref<null | number>(20_000);

const period = ref<CDatePickerRange | null>(null);

// The error shows from the first submit on, never while the user is typing
// the name for the first time.
const showErrors = ref(false);

const submitted = ref(false);

const projectField =
  useTemplateRef<HTMLElementTagNameMap['c-text-field']>('projectField');

const toasts = useTemplateRef<HTMLElementTagNameMap['c-toasts']>('toasts');

const onSubmit = () => {
  showErrors.value = true;

  // Take the user to the invalid field: its error message is read out as
  // it takes focus (getting-started, Accessibility).
  if (!project.value.trim()) {
    projectField.value?.focus();

    return;
  }

  submitted.value = true;

  toasts.value?.addToast({
    heading: 'Request submitted',
    message: 'This is a demo: nothing was sent.',
    type: 'success',
  });
};

// A form reset returns every field to its authored default (ADR-0084);
// the card's own state follows.
const onReset = () => {
  showErrors.value = false;
  submitted.value = false;
};
</script>

<style scoped>
.landing-task-card {
  container-type: inline-size;
}

.landing-task-card-fields {
  display: grid;
  gap: 0.75rem 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.landing-task-card-wide {
  grid-column: 1 / -1;
}

@container (width < 28rem) {
  .landing-task-card-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
