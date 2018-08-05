export const LEFT = 'ArrowLeft'
export const UP = 'ArrowUp'
export const RIGHT = 'ArrowRight'
export const DOWN = 'ArrowDown'
export const ENTER = 'Enter'
export const DEL = 'Delete'
export const BACKSPACE = 'Backspace'

const activeInstances = []

function processEvent (event, type) {
  if (
    event.target.tagName === 'INPUT' ||
    event.target.tagName === 'TEXTAREA'
  ) {
    return
  }
  const modifiers = []
  if (event.ctrlKey || event.metaKey) modifiers.push('ctrl')
  if (event.shiftKey) modifiers.push('shift')
  if (event.altKey) modifiers.push('alt')
  const info = {
    key: event.key,
    code: event.code,
    modifiers: modifiers.join('+')
  }
  let result = true
  activeInstances.forEach(opt => {
    if (opt[type]) {
      const r = opt[type].call(opt.vm, info)
      if (r === false) {
        result = false
      }
    }
  })
  if (!result) {
    event.preventDefault()
  }
}

document.addEventListener('keydown', (event) => {
  processEvent(event, 'onKeyDown')
})

export default function (options) {
  return {
    mounted () {
      activeInstances.push({
        vm: this,
        ...options
      })
    },
    destroyed () {
      const i = activeInstances.findIndex(
        o => o.vm === this
      )
      if (i >= 0) {
        activeInstances.splice(i, 1)
      }
    }
  }
}
