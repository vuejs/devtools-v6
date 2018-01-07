const electron = require('electron')
const spawn = require('cross-spawn')

const result = spawn.sync(
  electron,
  [
    require.resolve('./app')
  ],
  { stdio: 'ignore' }
)

process.exit(result.status)
