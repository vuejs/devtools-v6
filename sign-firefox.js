const path = require('path')
const fs = require('fs')
const execa = require('execa')

const credFile = path.resolve(__dirname, '.amo.env.json')

if (!fs.existsSync(credFile)) {
  fs.writeFileSync(credFile, JSON.stringify({
    apiKey: '',
    apiSecret: ''
  }, null, 2), { encoding: 'utf8' })
  console.log('Please provide Mozilla API credentials in .amo.env.json\nhttps://addons.mozilla.org/developers/addon/api/key/')
  process.exit(1)
}

const creds = JSON.parse(fs.readFileSync(credFile, {
  encoding: 'utf8'
}))

const child = execa('web-ext', [
  'sign',
  '--api-key', creds.apiKey,
  '--api-secret', creds.apiSecret,
  '-s', 'packages/shell-chrome',
  '-a', 'dist',
  '-i', 'src',
  '--id', '{c087fa6e-b59f-475d-b08d-f03fef34fa7f}'
], {
  shell: true,
  stdio: ['inherit', 'inherit', 'inherit']
})

child.on('exit', (code) => {
  process.exit(code)
})
