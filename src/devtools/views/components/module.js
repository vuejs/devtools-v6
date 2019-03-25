import Vue from 'vue'

const state = {
  selected: null,
  inspectedInstance: {},
  inspectedInstanceId: null,
  loading: false,
  instances: [],
  instancesMap: {},
  expansionMap: {},
  events: [],
  scrollToExpanded: null
}

const getters = {
  totalCount: state => Object.keys(state.instancesMap).length
}

let inspectTime = null

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
        if (inspectTime != null) {
          console.log(`inspect component took ${window.performance.now() - inspectTime}ms.`)
          inspectTime = null
        }
      })
    }

    state.loading = false
  },
  INSPECT_INSTANCE (state, instance) {
    state.inspectedInstanceId = instance.id
    state.loading = true

    if (process.env.NODE_ENV !== 'production') {
      inspectTime = window.performance.now()
    }
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.inspectedInstance = Object.freeze(instance)
    state.inspectedInstanceId = instance.id
    state.scrollToExpanded = null
  },
  TOGGLE_INSTANCE (state, { id, expanded, scrollTo = null } = {}) {
    Vue.set(state.expansionMap, id, expanded)
    state.scrollToExpanded = scrollTo
  }
}

const actions = {
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
