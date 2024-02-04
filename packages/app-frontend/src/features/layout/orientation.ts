import { ref } from 'vue'

const orientation = ref('landscape')

export function useOrientation() {
  return {
    orientation,
  }
}

const mediaQuery = window.matchMedia('(min-width: 685px)')
switchOrientation(mediaQuery)
mediaQuery.addEventListener('change', switchOrientation)

function switchOrientation(mediaQueryEvent: MediaQueryListEvent | MediaQueryList) {
  orientation.value = mediaQueryEvent.matches ? 'landscape' : 'portrait'
}
