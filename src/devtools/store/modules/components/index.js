import { set, nextTick } from 'vue'

const state = {
  selected: null,
  inspectedInstance: {},
  instances: [],
  expansionMap: {}
}

const mutations = {
  FLUSH (state, payload) {
    let start
    if (process.env.NODE_ENV !== 'production') {
      start = window.performance.now()
    }
    state.instances = Object.freeze(payload.instances)
    state.inspectedInstance = Object.freeze(payload.inspectedInstance)
    if (process.env.NODE_ENV !== 'production') {
      nextTick(() => {
        console.log(`devtools render took ${window.performance.now() - start}ms.`)
      })
    }
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.inspectedInstance = Object.freeze(instance)
  },
  TOGGLE_INSTANCE ({ expansionMap }, { id, expanded }) {
    set(expansionMap, id, expanded)
  }
}

export default {
  state,
  mutations
}
