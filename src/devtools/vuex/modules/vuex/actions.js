export function commitAll ({ dispatch, state }) {
  if (state.vuex.history.length > 0) {
    dispatch('vuex/COMMIT_ALL')
    travelTo(state)
  }
}

export function revertAll ({ dispatch, state }) {
  if (state.vuex.history.length > 0) {
    dispatch('vuex/REVERT_ALL')
    travelTo(state)
  }
}

export function commitSelected ({ dispatch, state }) {
  dispatch('vuex/COMMIT_SELECTED')
  travelTo(state)
}

export function revertSelected ({ dispatch, state }) {
  dispatch('vuex/REVERT_SELECTED')
  travelTo(state)
}

export function reset ({ dispatch, state }) {
  dispatch('vuex/RESET')
  travelTo(state)
}

export function step ({ dispatch, state }, index) {
  dispatch('vuex/STEP', index)
  travelTo(state)
}

export function importState (store, importedState) {
  store.dispatch('vuex/INIT', importedState)
  reset(store)
}

function travelTo (state) {
  const { history, activeIndex, base } = state.vuex
  const targetState = activeIndex > -1
    ? history[activeIndex].state
    : base
  bridge.send('vuex:travel-to-state', targetState)
}
