import { setupDevtoolsPlugin } from '@vue/devtools-api'

export default {
  install: (app) => {
    setupDevtoolsPlugin({
      id: 'test-plugin',
      label: 'Test devtools plugin',
      app
    }, (api) => {
      let time = 0

      api.on.inspectComponent((payload, ctx) => {
        if (payload.instanceData) {
          const stateType = 'extra properties (test)'
          payload.instanceData.state.push({
            type: stateType,
            key: 'foo',
            value: 'bar'
          })
          payload.instanceData.state.push({
            type: stateType,
            key: 'time',
            value: {
              _custom: {
                type: null,
                readOnly: true,
                display: `${time}s`,
                tooltip: 'Elapsed time',
                value: time,
              }
            }
          })
        }
      })

      setInterval(() => {
        time += 5
        api.notifyComponentUpdate()
      }, 5000)
    })
  }
}
