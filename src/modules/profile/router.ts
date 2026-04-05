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
      name: 'Profile posts',
      props: (route: RouteLocationNormalizedTyped) => ({
        username: route.params.username,
        listType: '',
      }),
      component: () => import('@/modules/profile/views/UserPostsView.vue'),
    },
    {
      path: 'liked',
      name: 'Liked posts',
      props: (route: RouteLocationNormalizedTyped) => ({
        username: route.params.username,
        listType: 'liked',
      }),
      component: () => import('@/modules/profile/views/UserLikedView.vue'),
    },
    {
      path: 'rated',
      name: 'Rated posts',
      props: (route: RouteLocationNormalizedTyped) => ({
        username: route.params.username,
        listType: 'rated',
      }),
      component: () => import('@/modules/profile/views/UserRatedView.vue'),
    },
  ],
}

export default router
