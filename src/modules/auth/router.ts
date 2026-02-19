import AuthLayout from '@/layouts/AuthLayout.vue'

const router = {
  path: '/auth',
  name: 'Authorization',
  meta: {
    title: 'Вход',
    layout: AuthLayout,
  },
  component: () => import('@/modules/auth/views/AuthView.vue'),
}

export default router
