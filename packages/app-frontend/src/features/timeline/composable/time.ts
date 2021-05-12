import {
  startTime,
  endTime,
  minTime,
  maxTime,
  cursorTime
} from './store'

export function useTime () {
  return {
    startTime,
    endTime,
    minTime,
    maxTime
  }
}

export function useCursor () {
  return {
    cursorTime
  }
}
