import { ref, computed } from '@vue/composition-api'

export interface ErrorMessage {
  message: string
  icon: string
}

const errors = ref<ErrorMessage[]>([])

export function putError (message: string, icon: string = null) {
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
