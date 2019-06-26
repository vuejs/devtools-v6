import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    inited: 0,
    count: 0,
    lastCountPayload: null,
    date: new Date(),
    set: new Set(),
    map: new Map(),
    sym: Symbol('test'),
    object: {
      name: 'I am Object',
      number: 0,
      children: [
        {
          number: 0
        }
      ]
    }
  },
  mutations: {
    TEST_INIT: state => state.inited++,
    INCREMENT: (state, payload) => {
      state.count++
      state.lastCountPayload = payload
    },
    DECREMENT: (state, payload) => {
      state.count--
      state.lastCountPayload = payload
    },
    UPDATE_DATE: state => {
      state.date = new Date()
    },
    TEST_COMPONENT: state => {},
    TEST_SET: state => {
      state.set.add(Math.random())
    },
    TEST_MAP: state => {
      state.map.set(`mykey_${state.map.size}`, state.map.size)
    }
  },
  getters: {
    isPositive: state => state.count >= 0,
    hours: state => state.date.getHours()
  },
  modules: {
    nested: {
      namespaced: true,
      state () {
        return {
          foo: 'bar'
        }
      },
      getters: {
        twoFoos: state => state.foo.repeat(2),
        dummy: () => {
          console.log('dummy getter was computed')
          return 'dummy'
        }
      },
      mutations: {
        ADD_BAR: (state) => {
          state.foo += 'bar'
        },
        REMOVE_BAR: (state) => {
          state.foo = state.foo.substr('bar'.length)
        }
      }
    }
  }
})
