import { onMounted, onUnmounted } from '@vue/composition-api'

function handleKeyboard (type, cb) {
  /**
   * @param {KeyboardEvent} event
   */
  function handler (event) {
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA'
    ) {
      return
    }

    const result = cb(event)
    if (!result) {
      event.preventDefault()
    }
  }

  onMounted(() => {
    document.addEventListener(type, handler)
  })

  onUnmounted(() => {
    document.removeEventListener(type, handler)
  })
}

/**
 * @param {(event: KeyboardEvent) => void | Promise<void>} cb
 */
export function onKeyUp (cb) {
  handleKeyboard('keyup', cb)
}

/**
 * @param {(event: KeyboardEvent) => void | Promise<void>} cb
 */
export function onKeyDown (cb) {
  handleKeyboard('keydown', cb)
}
