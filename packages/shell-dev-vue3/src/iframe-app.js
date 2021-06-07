import { createApp } from 'vue'
import Child from './Child.vue'

createApp({
  ...Child,
  name: 'IframeApp'
}).mount('#app')
