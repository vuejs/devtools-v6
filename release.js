const fs = require('node:fs')
const inquirer = require('inquirer')
const semver = require('semver')
const pkg = require('./package.json')
const manifest = require('./packages/shell-chrome/manifest.json')
const manifestFirefox = require('./packages/shell-firefox/manifest.json')

const IS_CI = !!(process.env.CIRCLECI || process.env.GITHUB_ACTIONS)

const curVersion = pkg.version

;(async () => {
  const { newVersion } = IS_CI
    ? { newVersion: curVersion }
    : await inquirer.prompt([{
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

  const { yes } = IS_CI
    ? { yes: true }
    : await inquirer.prompt([{
      name: 'yes',
      message: `Release ${newVersion}?`,
      type: 'confirm',
    }])

  if (yes) {
    const isBeta = newVersion.includes('beta')
    pkg.version = newVersion
    if (isBeta) {
      const [, baseVersion, betaVersion] = /(.*)-beta\.(\w+)/.exec(newVersion)
      manifest.version = `${baseVersion}.${betaVersion}`
      manifest.version_name = `${baseVersion} beta ${betaVersion}`
      applyIcons(manifest, '-beta')
    }
    else {
      manifest.version = newVersion
      manifest.version_name = newVersion
      applyIcons(manifest)
    }

    manifestFirefox.version = manifest.version
    manifestFirefox.version_name = manifest.version_name

    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2))
    {
      // Electron package
      const pkg = require('./packages/shell-electron/package.json')
      pkg.version = newVersion
      fs.writeFileSync('./packages/shell-electron/package.json', JSON.stringify(pkg, null, 2))
    }
    {
      // API package
      const pkg = require('./packages/api/package.json')
      pkg.version = newVersion
      fs.writeFileSync('./packages/api/package.json', JSON.stringify(pkg, null, 2))
    }
    fs.writeFileSync('./packages/shell-chrome/manifest.json', JSON.stringify(manifest, null, 2))
    fs.writeFileSync('./packages/shell-firefox/manifest.json', JSON.stringify(manifestFirefox, null, 2))
  }
  else {
    process.exit(1)
  }
})()

function applyIcons(manifest, suffix = '') {
  [16, 48, 128].forEach((size) => {
    manifest.icons[size] = `icons/${size}${suffix}.png`
  })
}
