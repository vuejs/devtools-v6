const state = {
  hasRouter: false,
  instances: [],
  routeChanges: [],
  inspectedIndex: -1,
}

const mutations = {
  'INIT' (state, payload) {
    state.hasRouter = true
    state.instances.push(payload)
  },
  'CHANGED' (state, payload) {
    state.routeChanges.push(payload)
  },
  'INSPECT' (state, index) {
    state.inspectedIndex = index
  }
}

const getters = {
  activeRouteChange: state => {
    return state.routeChanges[state.inspectedIndex]
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
