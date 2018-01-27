export let claissifyComponents = false

export default function (bridge) {
  bridge.on('config:classifyComponents', value => {
    claissifyComponents = value
  })
}
