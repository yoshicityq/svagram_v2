import MainLayout from '@/layouts/MainLayout.vue'

const router = {
  path: '/feed',
  name: 'Feed',
  meta: {
    layout: MainLayout,
    title: 'Лента',
  },
  component: () => import('@/modules/feed/views/FeedView.vue'),
}
export default router
