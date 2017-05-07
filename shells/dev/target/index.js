import Vue from 'vue'
import store from './store'
import App from './App.vue'

new Vue({
  store,
  components: {
    App
  },
  data: {
    obj: {

    }
  }
}).$mount('#app-container')
