import AuthLayout from '@/layouts/AuthLayout.vue'

const router = {
  path: '/reg',
  name: 'Registration',
  meta: {
    title: 'document_title.reg',
    layout: AuthLayout,
    requiresAuth: false,
  },
  component: () => import('@/modules/reg/views/RegView.vue'),
}

export default router
