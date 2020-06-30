import { createApp, h } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

createApp({
  render: () => h('h1', {}, 'App 2')
}).mount('#app2')
