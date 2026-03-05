import MainLayout from '@/layouts/MainLayout.vue'

const router = {
  path: '/:username',
  name: 'Profile',
  meta: {
    title: 'Профиль',
    layout: MainLayout,
    requiresAuth: true,
  },
  component: () => import('@/modules/profile/views/ProfileView.vue'),
}

export default router
