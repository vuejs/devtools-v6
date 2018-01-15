export const LEFT = 37
export const UP = 38
export const RIGHT = 39
export const DOWN = 40
export const S = 83

const activeInstances = []

document.addEventListener('keyup', e => {
  if (e.target.tagName === 'INPUT') {
    return
  }
  activeInstances.forEach(vm => {
    if (vm.onKeyUp) {
      vm.onKeyUp(e)
    }
  })
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
