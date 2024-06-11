import { computed, ref } from 'vue'
import { useNow } from '@vueuse/core'

const isConnected = ref(false)
const isInitializing = ref(true)
const lastDisconnect = ref(0)
const reloadTimes = ref(0)
let reloadRegistered = false

export function useAppConnection() {
  const now = useNow({
    interval: 1000,
  })
  const showDisplayDisconnected = computed(() => {
    if (isInitializing.value) {
      return false
    }
    if (lastDisconnect.value === 0) {
      return false
    }
    // Wait for 5 seconds before showing the disconnected message
    return !isConnected && now.value.getTime() - lastDisconnect.value > 5000
  })

  return {
    isConnected,
    isInitializing,
    lastDisconnect,
    showDisplayDisconnected,
    reloadTimes,
  }
}

export function setAppConnected(value: boolean, force = false, fromReload = false) {
  // We got disconnected from a page reload
  if (!value) {
    reloadRegistered = fromReload
  }

  if (force) {
    lastDisconnect.value = 0
  }
  else if (!value && isConnected.value) {
    lastDisconnect.value = Date.now()
  }
  isConnected.value = value

  // We are reconnected after a page reload
  if (value && reloadRegistered) {
    reloadTimes.value++
  }
}

export function setAppInitializing(value: boolean) {
  isInitializing.value = value
}
