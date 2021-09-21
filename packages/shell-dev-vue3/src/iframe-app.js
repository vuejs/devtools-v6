import { createApp, h } from 'vue'
import Child from './Child.vue'
import SetupScript from './SetupScript.vue'

createApp({
  name: 'IframeApp',
  render: () => [
    h(Child),
    h(SetupScript)
  ]
}).mount('#app')
