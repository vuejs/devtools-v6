import { set } from 'vue'

const state = {
  selected: null,
  inspectedInstance: {},
  instances: [],
  expansionMap: {}
}

const mutations = {
  FLUSH (state, payload) {
    state.instances = Object.freeze(payload.instances)
    state.inspectedInstance = Object.freeze(payload.inspectedInstance)
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.inspectedInstance = Object.freeze(instance)
  },
  TOGGLE_INSTANCE ({ expansionMap }, id, expanded) {
    set(expansionMap, id, expanded)
  }
}

export default {
  state,
  mutations
}
