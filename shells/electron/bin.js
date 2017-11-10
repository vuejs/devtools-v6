const electron = require('electron')
const spawn = require('cross-spawn')

const result = spawn.sync(
  electron,
  [require.resolve('./app')],
)

process.exit(result.status)