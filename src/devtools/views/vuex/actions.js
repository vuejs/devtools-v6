import { snapshotsCache } from './cache'
import SharedData from 'src/shared-data'

export function commitAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('COMMIT_ALL')
    travelTo(state, commit, -1)
  }
}

export function revertAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('REVERT_ALL')
    travelTo(state, commit, -1)
  }
}

export function commit ({ commit, state }, entry) {
  const index = state.history.indexOf(entry)
  if (index > -1) {
    commit('COMMIT', index)
    travelTo(state, commit, -1)
  }
}

export function revert ({ commit, state }, entry) {
  const index = state.history.indexOf(entry)
  if (index > -1) {
    commit('REVERT', index)
    travelTo(state, commit, state.history.length - 1)
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
    SharedData.snapshotLoading = {
      current: 0,
      total: 1
    }
    commit('UPDATE_INSPECTED_STATE', null)
    bridge.send('vuex:inspect-state', mutationIndex)
  }
}

export function timeTravelTo ({ state, commit }, entry) {
  travelTo(state, commit, state.history.indexOf(entry))
}

export function updateFilter ({ commit }, filter) {
  commit('UPDATE_FILTER', filter)
}

function travelTo (state, commit, index) {
  const { inspectedIndex } = state

  commit('UPDATE_INSPECTED_STATE', null)
  SharedData.snapshotLoading = {
    current: 0,
    total: 1
  }
  bridge.send('vuex:travel-to-state', index)

  if (index !== inspectedIndex) {
    commit('INSPECT', index)
  }
  commit('TIME_TRAVEL', index)
}
