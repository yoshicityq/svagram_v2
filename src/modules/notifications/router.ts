import MainLayout from '@/layouts/MainLayout.vue'

const router = {
  path: '/notifications',
  name: 'Notifications',
  meta: {
    title: 'Уведомления',
    layout: MainLayout,
  },
  component: () => import('@/modules/notifications/views/NotificationsView.vue'),
}

export default router
