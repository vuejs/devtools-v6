import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    inited: 0,
    count: 0,
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
    INCREMENT: state => state.count++,
    DECREMENT: state => state.count--,
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
  }
})
