<script setup lang="ts">
import { ref } from 'vue';
import HelloWorld from '../components/HelloWorld.vue'
import { CButton, CRadioGroup, CSelect, CTextField, CCheckbox } from 'csc-ui-vue-library';
import { MyComponent } from 'test-ui-vue';
import { IonButton, IonSelect, IonSelectOption, IonApp, IonContent  } from '@ionic/vue';

const test = ref('');
const items = ref([{ value: 1, name: 'uksinen'}, { value: 2, name: 'kaksinen'}]);
const ratiot = ref([{ value: 1, label: 'uksinen'}, { value: 2, label: 'kaksinen'}, { value: 3, label: 'kolminen'}]);
const himmeli = ref(1);
const kalsari = ref(1);
const check = ref(false);
const check2 = ref(false);
const render = ref(false);
const poopage = ref({ name: 'nisu', count: 6 });

const onKaasu = (e: Event) => {
  console.log('onKaasu', e);
};

const foods = [
  {
    id: 1,
    name: 'Apples',
    type: 'fruit',
  },
  {
    id: 2,
    name: 'Carrots',
    type: 'vegetable',
  },
  {
    id: 3,
    name: 'Cupcakes',
    type: 'dessert',
  },
];

const currentFood = ref();

const onClick = () => {
  alert('mopo');
};
</script>

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You suck!!" />
      <my-component v-model="check" .poop="poopage" return-value jokke>Tottahan se on</my-component>
      <my-component v-model="check2" .poop="poopage" jokke @change-value="onKaasu">Tottahan se on</my-component>
      <MyComponent v-model="check" .poop="poopage" :returnValue="true" jokke>Tottahan se on taas</MyComponent>
    </div>

    kekkikakki: {{ check2 }}
  </header>

  <main style="background-color: #fff; color: rgba(0,0,0,0.6); padding: 16px; display: grid; gap: 24px; border-radius: 6px;">
    <CButton>klicka här! {{ render }}</CButton>

    <CTextField v-model="test" label="keijjo" hide-details></CTextField>

    <p>inputted: {{ test }}</p>

    <c-select v-model="kalsari" .items="items" label="c-ei-toimi" hide-details return-value></c-select>
    <p>c-kalsari: {{ kalsari }}</p>

    <CSelect v-model="kalsari" .items="items" label="CToimii" hide-details return-value></CSelect>

    <p>CKalsari: {{ kalsari }}</p>

    <c-checkbox v-model="check" required hide-details @change-value="onKaasu">c-kaka</c-checkbox>
    <CCheckbox v-model="check" required hide-details @change-value="onKaasu">CKaka</CCheckbox>

    <p>check: {{ check }}</p>

    <c-radio-group .items="ratiot" v-model="himmeli" jokke return-value hide-details>c-radio</c-radio-group>
    <CRadioGroup .items="ratiot" v-model="himmeli" return-value hide-details>CRadio</CRadioGroup>
    <p>himmeli: {{ himmeli }} {{ typeof himmeli !== 'number' ? 'RETURN-VALUE EI TOIMI!!!!!' : '' }}</p> -->

        <ion-button @click="onClick">Default</ion-button>
        <ion-button disabled>Disabled</ion-button>

        <br />

        <ion-select
          aria-label="Food"
          label="Select fruit"
          v-model="currentFood"
          label-placement="floating"
          fill="outline"
          mode="md"
        >
          <ion-select-option v-for="food in foods" :key="food.id" :value="food">
            {{ food.name }}
          </ion-select-option>
        </ion-select>

        <p>Current value: {{ currentFood }}</p>
  <!-- </main> -->
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
