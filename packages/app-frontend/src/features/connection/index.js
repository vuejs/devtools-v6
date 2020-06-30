import { ref } from '@vue/composition-api'

const isConnected = ref(false)

export function useAppConnection () {
  return {
    isConnected
  }
}

export function setAppConnected (value) {
  isConnected.value = value
}
