import { onMounted, onUnmounted } from '@vue/composition-api'

/**
 * @param {(event: KeyboardEvent) => void | Promise<void>} cb
 */
export function onKeyUp (cb) {
  function handler (event) {
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA'
    ) {
      return
    }

    cb(event)
  }

  onMounted(() => {
    window.addEventListener('keyup', handler)
  })

  onUnmounted(() => {
    window.removeEventListener('keyup', handler)
  })
}
