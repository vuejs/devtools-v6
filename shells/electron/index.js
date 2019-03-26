require('./build/hook.js')

module.exports = {
  connect: function (host, port) {
    window.__VUE_DEVTOOLS_HOST__ = host
    window.__VUE_DEVTOOLS_PORT__ = port
    require('./build/backend.js')
  }
}
