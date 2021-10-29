// require modules
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const IS_CI = !!(process.env.CIRCLECI || process.env.GITHUB_ACTIONS)
const ProgressBar = !IS_CI ? require('progress') : {}
const readDirGlob = !IS_CI ? require('readdir-glob') : {}

const INCLUDE_GLOBS = [
  'build/**',
  'icons/**',
  'popups/**',
  'devtools.html',
  'devtools-background.html',
  'manifest.json',
  'package.json',
]
// SKIP_GLOBS makes glob searches more efficient
const SKIP_DIR_GLOBS = ['node_modules', 'src']

function bytesToSize (bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

(async () => {
  await writeZip('devtools-chrome.zip', 'shell-chrome')
  await writeZip('devtools-firefox.zip', 'shell-chrome')

  async function writeZip (fileName, packageDir) {
    // create a file to stream archive data to.
    const output = fs.createWriteStream(path.join(__dirname, 'dist', fileName))
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    })

    if (!IS_CI) {
      const status = {
        total: 0,
        cFile: '...',
        cSize: '0 Bytes',
        tBytes: 0,
        tSize: '0 Bytes',
      }

      async function parseFileStats () {
        return new Promise((resolve, reject) => {
          const globber = readDirGlob(path.join('packages', packageDir),
            { pattern: INCLUDE_GLOBS, skip: SKIP_DIR_GLOBS, mark: true, stat: true })
          globber.on('match', match => {
            if (!match.stat.isDirectory()) status.total++
          })
          globber.on('error', err => {
            reject(err)
          })
          globber.on('end', () => {
            resolve()
          })
        })
      }
      await parseFileStats().catch(err => {
        console.error(err)
        process.exit(1)
      })

      const bar = new ProgressBar(`${fileName} @ :tSize [:bar] :current/:total :percent +:cFile@:cSize`, {
        width: 18,
        incomplete: ' ',
        total: status.total,
      })
      bar.tick(0, status)

      archive.on('entry', (entry) => {
        if (!entry.stats.isDirectory()) {
          const n = entry.name
          status.written++
          status.cFile = n.length > 14
            ? '...' + n.slice(n.length - 11)
            : n
          status.cSize = bytesToSize(entry.stats.size)
          status.tBytes += entry.stats.size
          status.tSize = bytesToSize(status.tBytes)
          bar.tick(1, status)
        }
      })
    }

    const end = new Promise((resolve) => {
      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', () => {
        if (archive.pointer() < 1000) {
          console.warn(`Zip file (${fileName}) is only ${archive.pointer()} bytes`)
        }
        resolve()
      })
    })

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function () {
      'nothing'
    })

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
      if (err.code !== 'ENOENT') {
        // throw error
        console.error(err)
        process.exit(1)
      }
    })

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
      console.error(err)
      process.exit(1)
    })

    // pipe archive data to the file
    archive.pipe(output)

    INCLUDE_GLOBS.forEach(glob => {
      // append files from a glob pattern
      archive.glob(glob, { cwd: path.join('packages', packageDir), skip: SKIP_DIR_GLOBS })
    })

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize()

    await end
  }
})()
