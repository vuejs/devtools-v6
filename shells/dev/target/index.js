import Vue from 'vue'
import store from './store'
import App from './App.vue'

new Vue({
  store,
  components: {
    App
  }
}).$mount('#app-container')
