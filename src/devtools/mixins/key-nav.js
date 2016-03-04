const navMap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

export default {
  attached () {
    document.addEventListener('keyup', this.onKeyNavKeyUp)
  },
  detached () {
    document.removeEventListener('keyup', this.onKeyNavKeyUp)
  },
  methods: {
    onKeyNavKeyUp (e) {
      if (this.onKeyNav && navMap[e.keyCode]) {
        this.onKeyNav(navMap[e.keyCode])
      }
    }
  }
}
