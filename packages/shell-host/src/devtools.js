import { createApp } from 'vue'
import { setupPlugins } from '@front/plugins'
import DevIframe from './DevIframe.vue'

const app = createApp(DevIframe)
setupPlugins(app)
app.mount('#iframe-target')
