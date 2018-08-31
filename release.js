const fs = require('fs')
const inquirer = require('inquirer')
const semver = require('semver')
const pkg = require('./package.json')
const manifest = require('./shells/chrome/manifest.json')

const curVersion = pkg.version

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
    const isBeta = newVersion.includes('beta')
    pkg.version = newVersion
    if (isBeta) {
      const [, baseVersion, betaVersion] = /(.*)-beta\.(\w+)/.exec(newVersion)
      manifest.version = `${baseVersion}.${betaVersion}`
      manifest.version_name = `${baseVersion} beta ${betaVersion}`
      applyIcons(manifest, '-beta')
    } else {
      manifest.version = newVersion
      manifest.version_name = newVersion
      applyIcons(manifest)
    }

    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2))
    fs.writeFileSync('./shells/chrome/manifest.json', JSON.stringify(manifest, null, 2))
  } else {
    process.exit(1)
  }
})()

function applyIcons (manifest, suffix = '') {
  [16, 48, 128].forEach(size => {
    manifest.icons[size] = `icons/${size}${suffix}.png`
  })
}
