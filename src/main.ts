import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/router'
import '@/styles/base.css'
import useAuthStore from './stores/auth'
import { useRouter } from 'vue-router'
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
const auth = useAuthStore(pinia)
await auth.init()

app.use(router)
app.mount('#app')
