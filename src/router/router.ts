import MainLayout from '@/layouts/MainLayout.vue'
import auth from '@/modules/auth'
import feed from '@/modules/feed'
import HomeView from '@/modules/home/views/HomeView.vue'
import notifications from '@/modules/notifications'
import profile from '@/modules/profile'
import reg from '@/modules/reg'
import settings from '@/modules/settings'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: {
      title: 'Home',
      layout: MainLayout,
    },
    component: HomeView,
  },
]
const all_routes = [
  ...routes,
  auth.router,
  reg.router,
  feed.router,
  settings.router,
  notifications.router,
  profile.router,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: all_routes,
})

export default router
