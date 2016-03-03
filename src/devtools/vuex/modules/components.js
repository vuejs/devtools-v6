const state = {
  selected: null,
  inspectedInstance: {},
  instances: []
}

const mutations = {
  FLUSH (state, payload) {
    console.log(11)
    state.instances = payload.instances
    state.inspectedInstance = payload.inspectedInstance
  },
  SELECT_INSTANCE (state, target) {
    state.selected = target
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.inspectedInstance = instance
  }
}

export default {
  state,
  mutations
}
