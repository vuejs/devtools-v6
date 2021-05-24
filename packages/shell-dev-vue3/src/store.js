import { createStore } from 'vuex'

const store = createStore({
  state () {
    return {
      rootState: 'root'
    }
  },
  getters: {
    answer: () => 42
  },
  modules: {
    nested: {
      state () {
        return {
          foo: 'bar'
        }
      },
      getters: {
        twoFoo: state => state.foo.repeat(2)
      }
    },
    namespacedModule: {
      namespaced: true,
      state () {
        return {
          count: 0
        }
      },
      getters: {
        doubleCount: state => state.count * 2,
        tripleCount: state => state.count * 3
      },
      modules: {
        animals: {
          namespaced: true,
          state () {
            return {
              cat: 'Meow'
            }
          },
          getters: {
            dog: () => 'Waf'
          }
        }
      }
    }
  }
})

export default store
