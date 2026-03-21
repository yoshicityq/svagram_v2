import { createI18n } from 'vue-i18n'
import { messages } from './messages'
export const i18n = createI18n({
  locale: 'ru', // set locale
  legacy: false,
  mode: 'composition',
  useScope: 'global',
  globalInjection: true,
  fallbackLocale: 'en', // set fallback locale
  messages, // set locale messages
})
