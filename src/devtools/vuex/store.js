import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import inspector from './modules/inspector'
import vuex from './modules/vuex'
import router from './modules/router'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    inspector,
    vuex,
    router
  }
})

if (module.hot) {
  module.hot.accept([
    './modules/app',
    './modules/inspector',
    './modules/vuex',
    './modules/router'
  ], () => {
    try {
      store.hotUpdate({
        modules: {
          app: require('./modules/app').default,
          inspector: require('./modules/inspector').default,
          vuex: require('./modules/vuex').default,
          router: require('./modules/router').default
        }
      })
    } catch (e) {
      console.log(e.stack)
    }
  })
}
