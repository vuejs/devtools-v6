# Plugin API References

> :warning: This docs is WIP

::: warning
The API is only available in Vue Devtools 6+
:::

## Plugin setup

### setupDevtoolsPlugin

Registers a devtools plugin. Describes the plugin and provides access to the devtools API.

```js
setupDevtoolsPlugin (pluginDescriptor, setupFn)
```

The plugin descriptor is an object describing the devtools plugin to the Vue devtools user.

It has the following properties:

- `id`: a unique id between all possible plugins. It's recommended to use a Reverse Domain Name notation, for example: `org.vuejs.router`, or the npm package name.
- `label`: the label displayed to the user. It's recommended to use a user-friendly name from your plugin, for example: `'Vue Router'`. Do not put `'devtools'` or `'plugin'` in the name, since the user will be seeing this devtools plugin while using your Vue plugin already.
- `app`: the current application instance. The devtools is scoped to a specific application, so you have to specify on which application instance the devtools plugin is going to work.
- `packageName` (optional): The `npm` package name associated with the devtools plugin, for example `'vue-router'`.
- `homepage` (optional): URL to your documentation.
- `logo` (optional): URL to a logo of your Vue plugin.
- `componentStateTypes` (optional): an array of custom component state section names you are going to add to the Component inspector. If you add new state to the component inspector, you should declare their sections here so the devtools can display the plugin icon.

Example:

```js
const stateType = 'routing properties'

setupDevtoolsPlugin({
  id: 'org.vuejs.router',
  label: 'Vue Router',
  packageName: 'vue-router',
  homepage: 'https://router.vuejs.org/',
  logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
  componentStateTypes: [
    stateType
  ],
  app
}, (api) => {
  // Use the API here
})
```

## Component inspector

### on.visitComponentTree

```js
api.on.visitComponentTree((payload, ctx) => {
  const node = payload.treeNode
  if (node.name === 'MyApp') {
    node.tags.push({
      label: 'root',
      textColor: 0x000000,
      backgroundColor: 0xFF984F
    })
  } else {
    node.tags.push({
      label: 'test',
      textColor: 0xFFAAAA,
      backgroundColor: 0xFFEEEE
    })
  }
})
```

### on.inspectComponent

```js
api.on.inspectComponent((payload, ctx) => {
  if (payload.instanceData) {
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
```

### notifyComponentUpdate

```js
setInterval(() => {
  api.notifyComponentUpdate()
}, 5000)
```

## Custom inspector

### addInspector

```js
api.addInspector({
  id: 'test-inspector',
  label: 'Test inspector',
  icon: 'tab_unselected',
  treeFilterPlaceholder: 'Search for test...'
})
```

### on.getInspectorTree

```js
api.on.getInspectorTree(payload => {
  if (payload.app === app && payload.inspectorId === 'test-inspector') {
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
                backgroundColor: 0xFF984F
              },
              {
                label: 'test',
                textColor: 0xffffff,
                backgroundColor: 0x000000
              }
            ]
          }
        ]
      }
    ]
  }
})
```

### on.getInspectorState

```js
api.on.getInspectorState(payload => {
  if (payload.app === app && payload.inspectorId === 'test-inspector') {
    if (payload.nodeId === 'root') {
      payload.state = {
        'root info': [
          {
            key: 'foo',
            value: myState.foo,
            editable: true
          },
          {
            key: 'time',
            value: time
          }
        ]
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
                tooltip: 'The answer'
              }
            }
          }
        ]
      }
    }
  }
})
```

### on.editInspectorState

```js
api.on.editInspectorState(payload => {
  if (payload.app === app && payload.inspectorId === 'test-inspector') {
    if (payload.nodeId === 'root') {
      payload.set(myState, payload.path, payload.state.value)
    }
  }
})
```

### sendInspectorTree

```js
setInterval(() => {
  api.sendInspectorTree('test-inspector')
}, 5000)
```

### sendInspectorState

```js
setInterval(() => {
  api.sendInspectorState('test-inspector')
}, 5000)
```

## Timeline

### addTimelineLayer

```js
api.addTimelineLayer({
  id: 'test-layer',
  label: 'Test layer',
  color: 0x92A2BF
})
```

### addTimelineEvent

```js
api.addTimelineEvent({
  layerId: 'test-layer',
  event: {
    time: Date.now(),
    data: {
      info: 'window.keyup',
      key: event.key
    },
    groupId: event.key,
    title: 'Group test',
    meta: {
      foo: 'bar'
    }
  }
})
```

### on.inspectTimelineEvent

```js
api.on.inspectTimelineEvent(payload => {
  if (payload.layerId === 'test-layer') {
    // Async operation example
    return new Promise(resolve => {
      setTimeout(() => {
        payload.data = {
          ...payload.data,
          hey: 'hello'
        }
        resolve()
      }, 1000)
    })
  }
})
```

## Utilities

### getComponentBounds

```js
api.on.inspectComponent(async (payload, ctx) => {
  if (payload.instanceData) {
    const bounds = await api.getComponentBounds(payload.componentInstance)
    payload.instanceData.state.push({
      type: stateType,
      key: 'bounds',
      value: bounds ? {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height
      } : null
    })
  }
})
```

### getComponentName

```js
api.on.inspectComponent(async (payload, ctx) => {
  if (payload.instanceData) {
    const componentName = await api.getComponentName(payload.componentInstance)
    payload.instanceData.state.push({
      type: stateType,
      key: 'component name',
      value: name
    })
  }
})
```
