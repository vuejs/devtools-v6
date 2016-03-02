import Vue from 'vue'
import Vuex from 'vuex'
import components from './modules/components'
import vuex from './modules/vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    components,
    vuex
  }
})

if (module.hot) {
  module.hot.accept([
    './modules/components',
    './modules/vuex'
  ], () => {
    try {
      store.hotUpdate({
        modules: {
          inspector: require('./modules/components').default,
          vuex: require('./modules/vuex').default
        }
      })
    } catch (e) {
      console.log(e.stack)
    }
  })
}
