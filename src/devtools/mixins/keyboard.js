export const LEFT = 37
export const UP = 38
export const RIGHT = 39
export const DOWN = 40
export const C = 67
export const F = 70
export const R = 82
export const S = 83

const activeInstances = []

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') {
    return
  }
  let result = true
  activeInstances.forEach(vm => {
    if (vm.onKeyUp) {
      const r = vm.onKeyUp(e)
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
