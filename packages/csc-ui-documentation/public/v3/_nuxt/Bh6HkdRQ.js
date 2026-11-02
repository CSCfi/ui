const t=`
<div class="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
  <c-card style="width: 340px; max-width: 100%">
    <c-card-content>
      <h5>Per toast options</h5>

      <c-text-field
        v-model="messageText"
        v-control
        label="Message"
        hide-details
      />

      <c-text-field
        v-model="title"
        v-control
        label="Title (optional)"
        hide-details
      />

      <c-text-field
        v-model="closeText"
        v-control
        label="Close text (optional)"
        hide-details
      />

      <c-text-field
        v-model="duration"
        v-control
        label="Duration, ms (optional)"
        type="number"
        hint="Default: 6000ms"
      />

      <c-select
        v-model="type"
        v-control
        label="Type (optional)"
        :items="types"
        hint="Default: 'Info'"
      />

      <c-checkbox v-model="persistent" v-control hint="Default: false">
        Persistent (optional)
      </c-checkbox>

      <c-checkbox v-model="progress" v-control hint="Default: false">
        Show progress (optional)
      </c-checkbox>

      <c-button
        fit
        :disabled="(!custom && !messageText) || (custom && !customContent)"
        @click="onAddToast()"
      >
        Add toast
      </c-button>
    </c-card-content>
  </c-card>

  <div class="flex flex-col">
    <div class="flex flex-wrap gap-4">
      <c-select
        v-model="vertical"
        v-control
        label="Vertical position"
        :items="verticalOptions"
        hint="Default: 'Bottom'"
      />

      <c-select
        v-model="horizontal"
        v-control
        label="Horizontal position"
        :items="horizontalOptions"
        hint="Default: 'Right'"
      />

      <c-checkbox v-model="absolute" v-control hint="Default: false">
        Absolute positioning
      </c-checkbox>
    </div>

    <div
      class="rounded bg-tertiary-100 relative w-full h-full flex-1 min-h-[400px]"
    >
      <teleport to="body" :disabled="absolute">
        <c-toasts
          ref="toasts"
          :absolute="absolute"
          :horizontal="horizontal"
          :vertical="vertical"
        />
      </teleport>
    </div>
  </div>
</div>
`;export{t as default};
