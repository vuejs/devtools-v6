import storage from '../../storage'

const ENABLED_KEY = 'EVENTS_ENABLED'
const enabled = storage.get(ENABLED_KEY)

const state = {
  enabled: enabled == null ? true : enabled,
  hasRouter: false,
  instances: [],
  routeChanges: [],
  inspectedIndex: -1,
  filter: ''
}

const mutations = {
  'INIT' (state, payload) {
    state.instances = []
    state.inspectedIndex = -1
    state.hasRouter = true
    state.instances.push(payload)
  },
  'CHANGED' (state, payload) {
    state.routeChanges.push(payload)
  },
  'INSPECT' (state, index) {
    state.inspectedIndex = index
  },
  'UPDATE_FILTER' (state, filter) {
    state.filter = filter
  }
}

const getters = {
  activeRouteChange: state => {
    return state.routeChanges[state.inspectedIndex]
  },
  filteredRoutes: state => {
    return state.routeChanges.filter(routeChange => {
      return routeChange.path.indexOf(state.filter) > -1
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
