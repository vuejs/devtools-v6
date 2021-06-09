import { setupDevtoolsPlugin } from '@vue/devtools-api'

export default {
  install: (app) => {
    setupDevtoolsPlugin({
      id: 'simple-plugin',
      label: 'Simple devtools plugin',
      app
    }, (api) => {
      api.on.visitComponentTree((payload, ctx) => {
        payload.treeNode.tags.push({
          label: 'simple plugin',
          textColor: 0xFFAAAA,
          backgroundColor: 0xFFEEEE
        })
      })
    })
  }
}
