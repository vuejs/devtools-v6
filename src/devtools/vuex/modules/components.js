import { set } from 'vue'

const state = {
  selected: null,
  inspectedInstance: {},
  instances: [],
  expansionMap: {}
}

const mutations = {
  FLUSH (state, payload) {
    state.instances = payload.instances
    state.inspectedInstance = payload.inspectedInstance
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.inspectedInstance = instance
  },
  TOGGLE_INSTANCE ({ expansionMap }, id, expanded) {
    set(expansionMap, id, expanded)
  }
}

export default {
  state,
  mutations
}
