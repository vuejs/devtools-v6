import { ref } from '@vue/composition-api'

const isConnected = ref(false)
const isInitializing = ref(true)

export function useAppConnection () {
  return {
    isConnected,
    isInitializing
  }
}

export function setAppConnected (value: boolean) {
  isConnected.value = value
}

export function setAppInitializing (value: boolean) {
  isInitializing.value = value
}
