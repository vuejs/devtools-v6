export default {
  get (key) {
    localStorage.getItem(key)
  },
  set (key, val) {
    localStorage.setItem(key)
  },
  remove (key) {
    localStorage.removeItem(key)
  },
  clear () {
    localStorage.clear()
  }
}
