import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { reactive, ref } from 'vue'

/** @type {import('@vue/devtools-api').DevtoolsPluginApi} */
let devtoolsApi

const stateType = 'extra properties (test)'

export default {
  install: (app) => {
    setupDevtoolsPlugin({
      id: 'test-plugin',
      label: 'Test devtools plugin',
      packageName: '@vue/devtools-shell-dev-vue3',
      homepage: 'https://github.com/vuejs/vue-devtools',
      logo: 'https://nodepackjs.com/favicon.png',
      componentStateTypes: [
        stateType,
      ],
      enableEarlyProxy: true,
      settings: {
        test1: {
          label: 'I like vue devtools',
          type: 'boolean',
          defaultValue: true,
        },
        test2: {
          label: 'Quick choice',
          type: 'choice',
          defaultValue: 'a',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
            { value: 'c', label: 'C' },
          ],
          component: 'button-group',
        },
        test3: {
          label: 'Long choice',
          type: 'choice',
          defaultValue: 'a',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
            { value: 'c', label: 'C' },
            { value: 'd', label: 'D' },
            { value: 'e', label: 'E' },
          ],
        },
        test4: {
          label: 'What is your name?',
          type: 'text',
          defaultValue: '',
        },
      },
      app,
    }, (api) => {
      devtoolsApi = api

      console.log('settings', api.getSettings())

      const time = 0

      api.on.visitComponentTree((payload, ctx) => {
        const node = payload.treeNode
        if (node.name === 'MyApp') {
          node.tags.push({
            label: 'root',
            textColor: 0x000000,
            backgroundColor: 0xFF984F,
          })
        } else {
          node.tags.push({
            label: 'test',
            textColor: 0xFFAAAA,
            backgroundColor: 0xFFEEEE,
          })
        }
      })

      const componentState = {
        foo: 'bar',
      }

      api.on.inspectComponent((payload, ctx) => {
        if (payload.instanceData) {
          payload.instanceData.state.push({
            type: stateType,
            key: 'foo',
            value: componentState.foo,
            editable: true,
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
              },
            },
          })

          payload.instanceData.state.push({
            type: 'fail',
            key: 'state',
            editable: true,
            value: reactive({ n: ref(0) }),
          })

          return api.getComponentBounds(payload.componentInstance).then(bounds => {
            payload.instanceData.state.push({
              type: stateType,
              key: 'bounds',
              value: bounds
                ? {
                    left: bounds.left,
                    top: bounds.top,
                    width: bounds.width,
                    height: bounds.height,
                  }
                : null,
            })
          }).then(() => api.getComponentName(payload.componentInstance))
            .then(name => {
              payload.instanceData.state.push({
                type: stateType,
                key: 'component name',
                value: name,
              })
            })
        }
      })

      api.on.editComponentState(payload => {
        if (payload.type === stateType) {
          payload.set(componentState)
        }
      })

      // setInterval(() => {
      //   time += 5
      //   // Update component
      //   api.notifyComponentUpdate()
      //   // Update custom inspector
      //   api.sendInspectorTree('test-inspector')
      //   api.sendInspectorState('test-inspector')
      // }, 5000)

      api.addTimelineLayer({
        id: 'test-layer',
        label: 'Test layer with a name far too long that should really be much shorter',
        color: 0x92A2BF,
      })

      api.addTimelineEvent({
        layerId: 'test-layer',
        event: {
          time: api.now(),
          title: 'Early event',
          data: {},
        },
      })

      for (let i = 0; i < 10; i++) {
        api.addTimelineLayer({
          id: `test-layer-${i}`,
          label: `Empty ${i}`,
          color: 0x92A2BF,
        })
      }

      api.on.inspectTimelineEvent(payload => {
        if (payload.layerId === 'test-layer') {
          return new Promise(resolve => {
            payload.data = {
              ...payload.data,
              hey: 'hello',
            }
            setTimeout(resolve, 1000)
          })
        }
      })

      api.on.timelineCleared(() => {
        console.log('timeline is cleared!')
      })

      api.addInspector({
        id: 'test-inspector',
        label: 'Test inspector',
        icon: 'tab_unselected',
        treeFilterPlaceholder: 'Search for test...',
        noSelectionText: 'Select a node to view details',
        actions: [
          {
            icon: 'star',
            tooltip: 'Test custom action',
            action: () => {
              console.log('Meow! 🐱')
              api.selectInspectorNode('test-inspector', 'child')
            },
          },
        ],
        nodeActions: [
          {
            icon: 'help',
            tooltip: 'Test custom node action',
            action: (arg1) => {
              console.log('Node action', arg1)
              api.selectInspectorNode('test-inspector', 'child')
            },
          },
        ],
      })

      api.addInspector({
        id: 'test-inspector2',
        label: 'Test inspector 2',
      })

      let componentInstances = []

      api.on.getInspectorTree(payload => {
        if (payload.inspectorId === 'test-inspector') {
          payload.rootNodes = [
            {
              id: 'root',
              label: `Root (${time})`,
              children: [
                {
                  id: 'child',
                  label: `Child ${payload.filter}`,
                  tags: [
                    {
                      label: 'active',
                      textColor: 0x000000,
                      backgroundColor: 0xFF984F,
                    },
                    {
                      label: 'test',
                      textColor: 0xffffff,
                      backgroundColor: 0x000000,
                    },
                  ],
                },
              ],
            },
          ]
        } else if (payload.inspectorId === 'test-inspector2') {
          return api.getComponentInstances(app).then((instances) => {
            componentInstances = instances
            for (const instance of instances) {
              payload.rootNodes.push({
                id: instance.uid.toString(),
                label: `Component ${instance.uid}`,
              })
            }
          })
        }
      })

      const myState = {
        foo: 'bar',
      }

      api.on.getInspectorState(payload => {
        if (payload.inspectorId === 'test-inspector') {
          if (payload.nodeId === 'root') {
            payload.state = {
              'root info': [
                {
                  key: 'foo',
                  value: myState.foo,
                  editable: true,
                },
                {
                  key: 'time',
                  value: time,
                },
              ],
            }
          } else {
            payload.state = {
              'child info': [
                {
                  key: 'answer',
                  value: {
                    _custom: {
                      display: '42!!!',
                      value: 42,
                      tooltip: 'The answer',
                    },
                  },
                },
              ],
            }
          }
        } else if (payload.inspectorId === 'test-inspector2') {
          const instance = componentInstances.find(instance => instance.uid.toString() === payload.nodeId)
          if (instance) {
            api.unhighlightElement()
            api.highlightElement(instance)
          }
        }
      })

      api.on.editInspectorState(payload => {
        if (payload.inspectorId === 'test-inspector') {
          if (payload.nodeId === 'root') {
            payload.set(myState)
          }
        }
      })

      // Plugin settings change
      api.on.setPluginSettings(payload => {
        console.log('plugin settings changed', payload)
      })
    })

    // Outside of setupDevtoolsPlugin

    window.addEventListener('mouseup', event => {
      devtoolsApi && devtoolsApi.addTimelineEvent({
        layerId: 'test-layer',
        event: {
          time: devtoolsApi.now(),
          data: {
            info: 'window.mouseup',
            x: event.clientX,
            y: event.clientY,
          },
          logType: event.clientX < 100 ? 'error' : event.clientY < 100 ? 'warning' : 'default',
        },
      })
    })

    window.addEventListener('keydown', event => {
      devtoolsApi && devtoolsApi.addTimelineEvent({
        layerId: 'test-layer',
        event: {
          time: devtoolsApi.now(),
          data: {
            info: 'window.keyup',
            key: event.key,
          },
          groupId: event.key,
          title: 'Group test',
          meta: {
            foo: 'bar',
          },
        },
      })

      if (devtoolsApi && event.key === 's') {
        console.log('settings', devtoolsApi.getSettings())
      }
    })
  },
}
