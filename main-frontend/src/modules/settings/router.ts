import MainLayout from '@/layouts/MainLayout.vue'
import { useI18n } from 'vue-i18n'

const router = {
  path: '/settings',
  meta: {
    layout: MainLayout,
    requiresAuth: true,
  },
  component: () => import('@/modules/settings/views/SettingsView.vue'),
  redirect: { name: 'system' },
  children: [
    {
      path: 'edit_profile',
      meta: {
        title: 'document_title.edit_profile',
      },
      name: 'edit',
      component: () => import('@/modules/settings/views/EditProfileView.vue'),
    },
    {
      path: 'system',

      meta: {
        title: 'document_title.system_settings',
      },
      name: 'system',
      component: () => import('@/modules/settings/views/SystemView.vue'),
    },
    {
      path: 'change_userdata',
      meta: {
        title: 'document_title.account_settings',
      },
      name: 'userdata',
      component: () => import('@/modules/settings/views/ChangeUserdataView.vue'),
    },
  ],
}

export default router
