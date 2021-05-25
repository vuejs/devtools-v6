import * as storage from '@utils/storage'

const ENABLED_KEY = 'EVENTS_ENABLED'

const state = () => ({
  enabled: storage.get(ENABLED_KEY, true),
  hasRouter: false,
  routeChanges: [],
  inspectedIndex: -1,
  filter: ''
})

const mutations = {
  INIT (state, payload) {
    state.inspectedIndex = -1
    state.hasRouter = true
    state.routeChanges = payload.routeChanges
  },
  CHANGED (state, payload) {
    state.routeChanges.push(payload)
  },
  INSPECT (state, index) {
    state.inspectedIndex = index
  },
  UPDATE_FILTER (state, filter) {
    state.filter = filter
  }
}

const getters = {
  activeRouteChange: state => {
    if (typeof state.inspectedIndex === 'string') {
      const path = state.inspectedIndex.split('_')
      let obj = state.routeChanges[parseInt(path[0])]
      for (let i = 1, len = path.length; i < len; ++i) {
        obj = obj.children[parseInt(path[i])]
      }
      return obj
    }
    return state.routeChanges[state.inspectedIndex]
  },
  activeRoute: (state, getters, rootState) => {
    return state.routeChanges.find(
      change => rootState.router.routeChanges.find(
        historyChange => historyChange.to.path === change.path
      )
    )
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
