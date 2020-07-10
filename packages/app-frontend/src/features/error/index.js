import { ref, computed } from '@vue/composition-api'

const errors = ref([])

export function putError (message, icon = null) {
  // Dedupe
  if (errors.value.find(e => e.message === message)) {
    return
  }

  errors.value.push({
    message,
    icon
  })
}

export function clearError () {
  errors.value.shift()
}

export function useError () {
  const error = computed(() => errors.value[0])

  return {
    error,
    putError,
    clearError
  }
}
