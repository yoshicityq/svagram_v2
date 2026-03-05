import AuthLayout from '@/layouts/AuthLayout.vue'

const router = {
  path: '/auth',
  name: 'Authorization',
  meta: {
    title: 'Вход',
    layout: AuthLayout,
    requiresAuth: false,
  },
  component: () => import('@/modules/auth/views/AuthView.vue'),
}

export default router
