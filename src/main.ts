import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/router'
import '@/styles/base.css'
import useAuthStore from './stores/auth'
import { i18n } from './plugins/i18n'
const app = createApp(App)
const pinia = createPinia()
app.use(i18n)
app.use(pinia)
const auth = useAuthStore(pinia)
await auth.init()

app.use(router)
app.mount('#app')
