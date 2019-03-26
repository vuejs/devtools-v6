export const dynamic = {
  namespaced: true,
  state () {
    return {
      dynamic: true
    }
  },
  getters: {
    notDynamic: state => {
      if (state) return !state.dynamic
    }
  },
  mutations: {
    TOGGLE: state => {
      state.dynamic = !state.dynamic
    }
  }
}

export const nested = {
  namespaced: true,
  state () {
    return {
      nested: true
    }
  },
  getters: {
    notNested: state => {
      if (state) return !state.nested
    }
  },
  mutations: {
    TOGGLE_NESTED: state => {
      state.nested = !state.nested
    }
  }
}
