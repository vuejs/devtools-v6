import { ref, computed } from '@vue/composition-api'

export const darkMode = ref(false)

export function useDarkMode () {
  return {
    darkMode: computed(() => darkMode.value)
  }
}
