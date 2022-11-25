import { createStore } from 'vuex'

const store = createStore({
  state () {
    return {
      rootState: 'root',
      answer: 42,
    }
  },
  getters: {
    answer: (state) => state.answer,
    throws: () => {
      throw new Error('getter error')
    },
  },
  mutations: {
    increment (state) {
      state.answer++
    },
  },
  modules: {
    nested: {
      state () {
        return {
          foo: 'bar',
        }
      },
      getters: {
        twoFoo: state => state.foo.repeat(2),
      },
    },
    namespacedModule: {
      namespaced: true,
      state () {
        return {
          count: 0,
        }
      },
      getters: {
        doubleCount: state => state.count * 2,
        tripleCount: state => state.count * 3,
      },
      modules: {
        animals: {
          namespaced: true,
          state () {
            return {
              cat: 'Meow',
            }
          },
          getters: {
            dog: () => 'Waf',
          },
        },
      },
    },
  },
})

export default store
