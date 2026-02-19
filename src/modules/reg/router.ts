
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = {
  path: '/reg',
  name: 'Registration',
  meta: {
    title: 'Регистрация',
    layout: AuthLayout,
  },
  component: () => import('@/modules/reg/views/RegView.vue'),
}

export default router
