// If the users blocks 3rd party cookies and storage,
// localStorage will throw.

export default {
  get (key) {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch (e) {}
  },
  set (key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch (e) {}
  },
  remove (key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  },
  clear () {
    try {
      localStorage.clear()
    } catch (e) {}
  }
}
