import Vue from 'vue'
import Child from './Child.vue'

new Vue({
  ...Child,
  name: 'IframeApp'
}).$mount('#app')
