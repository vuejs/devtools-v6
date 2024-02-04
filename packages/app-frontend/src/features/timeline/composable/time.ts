import {
  cursorTime,
  endTime,
  maxTime,
  minTime,
  startTime,
} from './store'

export function useTime() {
  return {
    startTime,
    endTime,
    minTime,
    maxTime,
  }
}

export function useCursor() {
  return {
    cursorTime,
  }
}
