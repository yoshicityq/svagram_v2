import MainLayout from '@/layouts/MainLayout.vue'

const router = {
  path: '/notifications',
  name: 'Notifications',
  meta: {
    title: 'document_title.notifications',
    layout: MainLayout,
    requiresAuth: true,
  },
  component: () => import('@/modules/notifications/views/NotificationsView.vue'),
}

export default router
