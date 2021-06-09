import { createApp, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import App3 from './App3.vue'
import TestPlugin from './devtools-plugin'
import SimplePlugin from './devtools-plugin/simple'
import store from './store'

// eslint-disable-next-line no-extend-native
Array.prototype.foo = 'bar'

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
app.component('global', {
  render: () => 'I\'m a global component'
})
app.use(router)
app.use(store)
app.use(TestPlugin)
app.mount('#app')

const app2 = createApp({
  name: 'App2',
  render: () => h('h1', 'App 2')
})
app2.mount('#app2')

createApp(App3).mount('#app3')

createApp({
  render: () => h('button', {
    onClick: () => app2.unmount()
  }, 'Remove app 2'),
  devtools: {
    hide: true
  }
}).mount('#ghost-app')

setTimeout(() => {
  const app = createApp({
    name: 'DelayedApp',
    render: () => h('h1', 'Delayed app')
  })
  app.use(SimplePlugin)
  app.mount('#delay-app')
}, 1000)
