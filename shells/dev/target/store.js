import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
    date: new Date(),
    set: new Set(),
    map: new Map()
  },
  mutations: {
    INCREMENT: state => state.count++,
    DECREMENT: state => state.count--,
    UPDATE_DATE: state => {
      state.date = new Date()
    },
    TEST_COMPONENT: state => {},
    'TEST_SET/mutation_type_long_using_underscore_break': state => {
      state.set.add(Math.random())
    },
    'TEST_MAP/mutation-type-long-using-dash-will-break': state => {
      state.map.set(`mykey_${state.map.size}`, state.map.size)
    }
  },
  getters: {
    isPositive: state => state.count >= 0,
    hours: state => state.date.getHours()
  }
})
