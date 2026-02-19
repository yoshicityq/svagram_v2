import MainLayout from '@/layouts/MainLayout.vue'

const router = {
  path: '/settings',
  meta: {
    title: 'Настройки',
    layout: MainLayout,
  },
  component: () => import('@/modules/settings/views/SettingsView.vue'),
  redirect: { name: 'system' },
  children: [
    {
      path: 'edit_profile',
      name: 'edit',
      component: () => import('@/modules/settings/views/EditProfileView.vue'),
    },
    {
      path: 'system',
      name: 'system',
      component: () => import('@/modules/settings/views/SystemView.vue'),
    },
    {
      path: 'change_userdata',
      name: 'userdata',
      component: () => import('@/modules/settings/views/ChangeUserdataView.vue'),
    },
  ],
}

export default router
