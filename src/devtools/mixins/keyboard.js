export const LEFT = 'ArrowLeft'
export const UP = 'ArrowUp'
export const RIGHT = 'ArrowRight'
export const DOWN = 'ArrowDown'
export const ENTER = 'Enter'
export const DEL = 'Delete'

const activeInstances = []

document.addEventListener('keydown', e => {
  if (
    e.target.tagName === 'INPUT' ||
    e.target.tagName === 'TEXTAREA'
  ) {
    return
  }
  const modifiers = []
  if (e.ctrlKey || e.metaKey) modifiers.push('ctrl')
  if (e.shiftKey) modifiers.push('shift')
  if (e.altKey) modifiers.push('alt')
  const info = {
    key: e.key,
    modifiers: modifiers.join('+')
  }
  let result = true
  activeInstances.forEach(vm => {
    if (vm.onKeyDown) {
      const r = vm.onKeyDown(info)
      if (r === false) {
        result = false
      }
    }
  })
  if (!result) {
    e.preventDefault()
  }
})

export default {
  mounted () {
    activeInstances.push(this)
  },
  destroyed () {
    const i = activeInstances.indexOf(this)
    if (i >= 0) {
      activeInstances.splice(i, 1)
    }
  }
}
