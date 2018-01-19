import Vue from 'vue'
import storage from '../../storage'

const CLASSIFY_COMPONENTS_KEY = 'CLASSIFY_COMPONENTS'
const classifyComponents = storage.get(CLASSIFY_COMPONENTS_KEY)

const state = {
  selected: null,
  inspectedInstance: {},
  instances: [],
  instancesMap: {},
  expansionMap: {},
  events: [],
  scrollToExpanded: null,
  classifyComponents: classifyComponents == null ? true : classifyComponents
}

const mutations = {
  FLUSH (state, payload) {
    let start
    if (process.env.NODE_ENV !== 'production') {
      start = window.performance.now()
    }

    // Instance ID map
    // + add 'parent' properties
    const map = {}
    function walk (instance) {
      map[instance.id] = instance
      if (instance.children) {
        instance.children.forEach(child => {
          child.parent = instance
          walk(child)
        })
      }
    }
    payload.instances.forEach(walk)

    // Mutations
    state.instances = Object.freeze(payload.instances)
    state.inspectedInstance = Object.freeze(payload.inspectedInstance)
    state.instancesMap = Object.freeze(map)

    if (process.env.NODE_ENV !== 'production') {
      Vue.nextTick(() => {
        console.log(`devtools render took ${window.performance.now() - start}ms.`)
      })
    }
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.inspectedInstance = Object.freeze(instance)
    state.scrollToExpanded = null
  },
  TOGGLE_INSTANCE (state, { id, expanded, scrollTo = null } = {}) {
    Vue.set(state.expansionMap, id, expanded)
    state.scrollToExpanded = scrollTo
  },
  CLASSIFY_COMPONENTS (state, value) {
    state.classifyComponents = value
  }
}

const actions = {
  init: {
    handler ({ state }) {
      bridge.send('config:classifyComponents', state.classifyComponents)
    },
    root: true
  },
  toggleInstance ({ commit, dispatch, state }, { instance, expanded, recursive, parent = false } = {}) {
    const id = instance.id

    commit('TOGGLE_INSTANCE', {
      id,
      expanded,
      scrollTo: parent ? id : null
    })

    if (recursive) {
      instance.children.forEach((child) => {
        dispatch('toggleInstance', {
          instance: child,
          expanded,
          recursive
        })
      })
    }

    // Expand the parents
    if (parent) {
      let i = instance
      while (i.parent) {
        i = i.parent
        commit('TOGGLE_INSTANCE', {
          id: i.id,
          expanded: true,
          scrollTo: id
        })
      }
    }
  },

  toggleClassifyComponents ({ state, commit }) {
    const newValue = !state.classifyComponents
    commit('CLASSIFY_COMPONENTS', newValue)
    storage.set(CLASSIFY_COMPONENTS_KEY, newValue)
    bridge.send('config:classifyComponents', newValue)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
