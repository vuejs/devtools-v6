import { ref } from '@vue/composition-api'

const orientation = ref('landscape')

export function useOrientation () {
  return {
    orientation
  }
}

const mediaQuery = window.matchMedia('(min-width: 685px)')
switchOrientation(mediaQuery)
mediaQuery.addListener(switchOrientation)

function switchOrientation (mediaQueryEvent) {
  orientation.value = mediaQueryEvent.matches ? 'landscape' : 'portrait'
}
