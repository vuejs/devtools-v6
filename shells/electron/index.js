module.exports = {
  connect: () => {
    require('./build/hook.js')
    require('./build/backend.js')
  }
}
