import Vue from 'vue'

const state = {
  selected: null,
  inspectedInstance: {},
  instances: [],
  expansionMap: {},
  events: []
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
      Vue.nextTick(() => {
        console.log(`devtools render took ${window.performance.now() - start}ms.`)
      })
    }
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.inspectedInstance = Object.freeze(instance)
  },
  TOGGLE_INSTANCE ({ expansionMap }, { id, expanded }) {
    Vue.set(expansionMap, id, expanded)
  }
}

const actions = {
  toggleInstance ({commit, dispatch}, {instance, expanded, recursive}) {
    commit('TOGGLE_INSTANCE', {id: instance.id, expanded})

    if (recursive) {
      instance.children.forEach((child) => {
        dispatch('toggleInstance', {
          instance: child,
          expanded,
          recursive
        })
      })
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
