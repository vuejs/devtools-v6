import { setupDevtoolsPlugin } from '@vue/devtools-api'

/** @type {import('@vue/devtools-api').DevtoolsPluginApi} */
let devtoolsApi

export default {
  install: (app) => {
    setupDevtoolsPlugin({
      id: 'test-plugin',
      label: 'Test devtools plugin',
      app
    }, (api) => {
      devtoolsApi = api

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
                value: time
              }
            }
          })
        }
      })

      setInterval(() => {
        time += 5
        api.notifyComponentUpdate()
      }, 5000)

      api.addTimelineLayer({
        id: 'test-layer',
        label: 'Test layer',
        color: 0x92A2BF
      })
    })

    // Outside of setupDevtoolsPlugin

    window.addEventListener('mouseup', event => {
      devtoolsApi.addTimelineEvent({
        layerId: 'test-layer',
        event: {
          time: Date.now(),
          data: {
            info: 'window.mouseup',
            x: event.clientX,
            y: event.clientY
          }
        }
      })
    })
  }
}
