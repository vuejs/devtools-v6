import { createApp } from 'vue'
import DevIframe from './DevIframe.vue'
import { setupPlugins } from '@front/plugins'

const app = createApp(DevIframe)
setupPlugins(app)
app.mount('#iframe-target')
