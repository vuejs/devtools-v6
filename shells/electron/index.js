require('./build/hook.js')

module.exports = {
  connect: () => {
    require('./build/backend.js')
  }
}
