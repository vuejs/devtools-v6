import { onMounted, onUnmounted } from '@vue/composition-api'

type KeyboardHandler = (event: KeyboardEvent) => boolean | void | Promise<boolean | void>
function handleKeyboard (type: 'keyup' | 'keydown', cb: KeyboardHandler) {
  function handler (event: KeyboardEvent) {
    if (event.target instanceof HTMLElement && (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA'
    )) {
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

export function onKeyUp (cb: KeyboardHandler) {
  handleKeyboard('keyup', cb)
}

export function onKeyDown (cb: KeyboardHandler) {
  handleKeyboard('keydown', cb)
}
