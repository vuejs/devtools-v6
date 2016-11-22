const navMap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

const activeInstances = []

document.addEventListener('keyup', e => {
  if (navMap[e.keyCode]) {
    activeInstances.forEach(vm => {
      if (vm.onKeyNav) {
        vm.onKeyNav(navMap[e.keyCode])
      }
    })
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
