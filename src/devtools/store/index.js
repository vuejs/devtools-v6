import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import components from './modules/components'
import vuex from './modules/vuex'
import events from './modules/events'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    components,
    vuex,
    events
  }
})

export default store

if (module.hot) {
  module.hot.accept([
    './modules/app',
    './modules/components',
    './modules/vuex',
    './modules/events'
  ], () => {
    try {
      store.hotUpdate({
        modules: {
          app: require('./modules/app').default,
          components: require('./modules/components').default,
          vuex: require('./modules/vuex').default,
          events: require('./modules/events').default
        }
      })
    } catch (e) {
      console.log(e.stack)
    }
  })
}
