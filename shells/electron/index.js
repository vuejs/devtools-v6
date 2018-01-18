require('./build/hook.js')

module.exports = {
  connect: (host) => {
    window.__VUE_DEVTOOLS_HOST__ = host
    require('./build/backend.js')
  }
}
