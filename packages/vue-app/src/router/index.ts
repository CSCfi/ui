import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomePage from '@/views/HomeView.vue';
import AboutPage from '@/views/AboutView.vue';
import AppVue from '@/App.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: AppVue
},
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

export default router;
