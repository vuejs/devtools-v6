const fs = require('fs')
const inquirer = require('inquirer')
const semver = require('semver')
const pkg = require('./package.json')
const manifest = require('./shells/chrome/manifest.json')

const curVersion = manifest.version
const newVersion = process.argv[2]

;(async () => {
  const { newVersion } = await inquirer.prompt([{
    type: 'input',
    name: 'newVersion',
    message: `Please provide a version (current: ${curVersion}):`,
  }])

  if (!semver.valid(newVersion)) {
    console.error(`Invalid version: ${newVersion}`)
    process.exit(1)
  }

  if (semver.lt(newVersion, curVersion)) {
    console.error(`New version (${newVersion}) cannot be lower than current version (${curVersion}).`)
    process.exit(1)
  }

  const { yes } = await inquirer.prompt([{
    name: 'yes',
    message: `Release ${newVersion}?`,
    type: 'confirm'
  }])

  if (yes) {
    pkg.version = newVersion
    manifest.version = newVersion
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2))
    fs.writeFileSync('./shells/chrome/manifest.json', JSON.stringify(manifest, null, 2))
  } else {
    process.exit(1)
  }
})()
