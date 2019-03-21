export default {
  namespaced: true,
  state () {
    return {
      dynamic: true
    }
  },
  getters: {
    notDynamic: state => {
      console.log('notDynamic', JSON.stringify(state, null, 2))
      if (state) return !state.dynamic
    }
  },
  mutations: {
    TOGGLE: state => {
      state.dynamic = !state.dynamic
    }
  }
}
