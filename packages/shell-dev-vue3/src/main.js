import { createApp, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import App3 from './App3.vue'
import TestPlugin from './devtools-plugin'

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: '/p1',
      component: import('./router/Page1.vue')
    },
    {
      path: '/p2',
      component: import('./router/Page2.vue')
    }
  ]
})

const app = createApp(App)
app.use(TestPlugin)
app.use(router)
app.mount('#app')

createApp({
  render: () => h('h1', 'App 2')
}).mount('#app2')

createApp(App3).mount('#app3')

createApp({
  render: () => h('h1', 'Ghost app'),
  devtools: {
    hide: true
  }
}).mount('#ghost-app')
