import { getStorage, setStorage } from '@utils/storage'

const ENABLED_KEY = 'EVENTS_ENABLED'

let uid = 0

const state = () => ({
  enabled: getStorage(ENABLED_KEY, true),
  hasRouter: false,
  instances: [],
  routeChanges: [],
  inspectedIndex: -1,
  filter: ''
})

const mutations = {
  'INIT' (state, payload) {
    payload.current.id = uid++
    state.instances = []
    state.routeChanges = [payload.current]
    state.inspectedIndex = -1
    state.hasRouter = true
    state.instances.push(payload)
  },
  'RESET' (state) {
    state.routeChanges = []
    state.inspectedIndex = -1
  },
  'CHANGED' (state, payload) {
    payload.id = uid++
    state.routeChanges.push(payload)
    if (!state.filter) {
      state.inspectedIndex = state.routeChanges.length - 1
    }
  },
  'INSPECT' (state, index) {
    state.inspectedIndex = index
  },
  'UPDATE_FILTER' (state, filter) {
    state.filter = filter
  },
  'TOGGLE' (state) {
    setStorage(ENABLED_KEY, state.enabled = !state.enabled)
    bridge.send('router:toggle-recording', state.enabled)
  }
}

const getters = {
  activeRouteChange: state => {
    return state.routeChanges[state.inspectedIndex]
  },
  filteredRoutes: state => {
    return state.routeChanges.filter(routeChange => {
      return routeChange.from.fullPath.indexOf(state.filter) > -1 || routeChange.to.fullPath.indexOf(state.filter) > -1
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
