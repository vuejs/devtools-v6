import { snapshotsCache } from './cache'
import Resolve from './resolve'
import SharedData from 'src/shared-data'

export function commitAll ({ commit, state }) {
  if (state.history.length > 0) {
    travelTo(state, commit, state.history.length - 1).then(() => {
      snapshotsCache.reset()
      bridge.send('vuex:commit-all')
      commit('COMMIT_ALL')
    })
  }
}

export function revertAll ({ commit, state }) {
  if (state.history.length > 0) {
    travelTo(state, commit, -1).then(() => {
      snapshotsCache.reset()
      bridge.send('vuex:revert-all')
      commit('REVERT_ALL')
    })
  }
}

export function commit ({ commit, state }, entry) {
  const index = state.history.indexOf(entry)
  if (index > -1) {
    travelTo(state, commit, index, false).then(() => {
      snapshotsCache.reset()
      bridge.send('vuex:commit', index)
      commit('COMMIT', index)
      travelTo(state, commit, state.history.length - 1)
    })
  }
}

export function revert ({ commit, state }, entry) {
  const index = state.history.indexOf(entry)
  if (index > -1) {
    travelTo(state, commit, index - 1).then(() => {
      snapshotsCache.reset()
      bridge.send('vuex:revert', index)
      commit('REVERT', index)
    })
  }
}

export function inspect ({ commit, getters }, entryOrIndex) {
  let index = typeof entryOrIndex === 'number'
    ? entryOrIndex
    : getters.filteredHistory.indexOf(entryOrIndex)
  if (index < -1) index = -1
  if (index >= getters.filteredHistory.length) index = getters.filteredHistory.length - 1
  commit('INSPECT', index)

  const entry = getters.filteredHistory[index]
  const mutationIndex = entry ? entry.mutation.index : -1
  const cached = snapshotsCache.get(mutationIndex)
  if (cached) {
    commit('UPDATE_INSPECTED_STATE', cached)
  } else {
    SharedData.snapshotLoading = true
    commit('UPDATE_INSPECTED_STATE', null)
    bridge.send('vuex:inspect-state', mutationIndex)
  }
}

export function timeTravelTo ({ state, commit }, entry) {
  return travelTo(state, commit, state.history.indexOf(entry))
}

export function updateFilter ({ commit }, filter) {
  commit('UPDATE_FILTER', filter)
}

export function editState ({ state }, { path, args }) {
  if (state.inspectedIndex !== -1) snapshotsCache.del(state.inspectedIndex)
  bridge.send('vuex:edit-state', {
    index: state.inspectedIndex,
    path,
    ...args
  })
}

function travelTo (state, commit, index, apply = true) {
  return new Promise((resolve) => {
    Resolve.travel = resolve
    const { inspectedIndex } = state

    commit('UPDATE_INSPECTED_STATE', null)
    SharedData.snapshotLoading = true
    bridge.send('vuex:travel-to-state', { index, apply })

    if (index !== inspectedIndex) {
      commit('INSPECT', index)
    }
    commit('TIME_TRAVEL', index)
  })
}
