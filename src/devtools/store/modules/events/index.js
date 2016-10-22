const state = {
  emitted: [],
  activeIndex: 0,
  newEventCount: 0
}

const mutations = {
  'events/EMIT' (state, payload) {
    state.emitted.push(payload)
    state.activeIndex = state.emitted.length - 1
  },
  'events/RESET' (state) {
    state.emitted = []
  },
  'events/STEP' (state, n) {
    state.activeIndex = n
  },
  'events/RESET_NEW_EVENT_COUNT' (state) {
    state.newEventCount = 0
  },
  'events/INCREASE_NEW_EVENT_COUNT' (state) {
    state.newEventCount++
  }
}

const getters = {
  activeEvent: state => state.emitted[state.activeIndex],
  eventData: (state, getters) => getters.activeEvent.eventData,
  instanceName: (state, getters) => getters.activeEvent.instanceName,
  eventName: (state, getters) => getters.activeEvent.eventName,
  hasEvents: state => state.emitted.length > 0
}

export default {
  state,
  mutations,
  getters
}
