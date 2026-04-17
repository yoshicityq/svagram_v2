import MainLayout from '@/layouts/MainLayout.vue'
import { useRoute, type RouteLocationNormalizedTyped } from 'vue-router'

const router = {
  path: '/:username',
  meta: {
    title: 'Профиль',
    layout: MainLayout,
    requiresAuth: true,
  },
  component: () => import('@/modules/profile/views/ProfileView.vue'),
  children: [
    {
      path: '',
      name: 'posts',
      props: (route: RouteLocationNormalizedTyped) => ({
        username: route.params.username,
        listType: '',
      }),
      component: () => import('@/modules/profile/views/UserPostsView.vue'),
    },
    {
      path: 'liked',
      name: 'posts_liked',
      props: (route: RouteLocationNormalizedTyped) => ({
        username: route.params.username,
        listType: 'liked',
      }),
      component: () => import('@/modules/profile/views/UserLikedView.vue'),
    },
    {
      path: 'rated',
      name: 'posts_rated',
      props: (route: RouteLocationNormalizedTyped) => ({
        username: route.params.username,
        listType: 'rated',
      }),
      component: () => import('@/modules/profile/views/UserRatedView.vue'),
    },
  ],
}

export default router
