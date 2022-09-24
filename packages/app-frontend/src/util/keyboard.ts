import { onMounted, onUnmounted } from 'vue'

type KeyboardHandler = (event: KeyboardEvent) => boolean | void | Promise<boolean | void>

function handleKeyboard (type: 'keyup' | 'keydown', cb: KeyboardHandler, force: boolean) {
  function handler (event: KeyboardEvent) {
    if (!force && (
      typeof HTMLElement !== 'undefined' && event.target instanceof HTMLElement && (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA'
      )
    )) {
      return
    }

    const result = cb(event)
    if (result === false) {
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

export function onKeyUp (cb: KeyboardHandler, force = false) {
  handleKeyboard('keyup', cb, force)
}

export function onKeyDown (cb: KeyboardHandler, force = false) {
  handleKeyboard('keydown', cb, force)
}
