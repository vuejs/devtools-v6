# Plugin API References

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
- `app`: the current application instance. The devtools is scoped to a specific application, so you have to specify on which application instance the devtools plugin is going to work.
- `label`: the label displayed to the user. It's recommended to use a user-friendly name from your plugin, for example: `'Vue Router'`. Do not put `'devtools'` or `'plugin'` in the name, since the user will be seeing this devtools plugin while using your Vue plugin already.
- `packageName` (optional): The `npm` package name associated with the devtools plugin, for example `'vue-router'`.
- `homepage` (optional): URL to your documentation.
- `logo` (optional): URL to a logo of your Vue plugin.
- `componentStateTypes` (optional): an array of custom component state section names you are going to add to the Component inspector. If you add new state to the component inspector, you should declare their sections here so the devtools can display the plugin icon.
- `disableAppScope` (optional): if set to `true`, the hooks registered with this plugin will not be scoped to the associated app. In that case, you might need to use the `app` payload property to check what the current app is inside each hook.

Example:

```js
const stateType = 'routing properties'

setupDevtoolsPlugin({
  id: 'org.vuejs.router',
  app,
  label: 'Vue Router',
  packageName: 'vue-router',
  homepage: 'https://router.vuejs.org/',
  logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
  componentStateTypes: [
    stateType
  ]
}, api => {
  // Use the API here
})
```

## Component inspector

### on.visitComponentTree

Use this hook to add tags in the component tree.

The `payload` argument:
- `app`: app instance currently active in the devtools
- `componentInstance`: the current component instance data in the tree
- `treeNode`: the tree node that will be sent to the devtools
- `filter`: the current value of the seach input above the tree in the component inspector

Example:

```js
api.on.visitComponentTree(payload => {
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
      backgroundColor: 0xFFEEEE,
      tooltip: `It's a test!`
    })
  }
})
```

### on.inspectComponent

Use this hook to add new information to the state of the selected component.

The `payload` argument:
- `app`: app instance currently active in the devtools
- `componentInstance`: the current component instance data in the tree
- `instanceData`: the state that will be sent to the devtools

To add new state, you can push new fields into the `instanceData.state` array:

#### Basic field

- `type`: name of the section under which the field will appear
- `key`: name of the field
- `value`: value of the field
- `editable` (optional): boolean to enable edition

#### Custom value

By default, the devtools will display your field depending on whether it's an object, an array, etc. You can customize the field display by putting a `{ _custom: {} }` object to the value.

The `_custom` object has the following properties:

- `type`: Displays the type of the value. Examples: `'router'`, `'component'`, `'service'`...
- `display`: Text displayed instead of the value. Example: `'5 minutes'`
- `tooltip`: Tooltip when hovering the value text (`display`)
- `value`: Actual value
- `abstract`: No value is displayed. Useful for indexes. For example, `Set` objects have abstract index child fields: `0`, `1`...
- `readOnly`: mark this value has not editable
- `fields`: an object of configure immediate child fields
  - `abstract`
- `actions`: an array of buttons to add to the field
  - `icon`: material icon identifier
  - `tooltip`: button tooltip
  - `action`: function to be executed

When you add new sections with the `type` property, you should declare them in the `componentStateTypes` array in the plugin descriptor when you call the `setupDevtoolsPlugin`.

Example:

```js
api.on.inspectComponent(payload => {
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
          value: time,
          actions: [
            {
              icon: 'input',
              tooltip: 'Log to console',
              action: () => console.log('current time:', time)
            }
          ]
        }
      }
    })
  }
})
```

### on.editComponentState

If you mark a field as `editable: true`, you should also use this hook to apply the new value sent by the devtools.

You have to put a condition in the callback to target only your field type:

```js
api.on.editComponentState(payload => {
  if (payload.type === stateType) {
    // Edit logic here
  }
})
```

The `payload` argument:
- `app`: app instance currently active in the devtools
- `type`: the current field type
- `path`: an array of string that represents the property edited by the user. For example, if the user edits the `myObj.myProp.hello` property, the `path` will be `['myObj', 'myProp', 'hello']`.
- `state`: object describing the edit with those properties:
  - `value`: new value
  - `newKey`: string that is set if the key of the value changed, usually when it's in an object
  - `remove`: if `true`, the value should be removed from the object or array
- `set`: an helper function that makes it easy to apply the edit on a state object

Example:

```js
api.on.editComponentState(payload => {
  if (payload.type === stateType) {
    payload.set(myState)
  }
})
```

Here is a full example of an editable custom component field:

```js
const myState = {
  foo: 'bar'
}

api.on.inspectComponent(payload => {
  if (payload.instanceData) {
    payload.instanceData.state.push({
      type: stateType,
      key: 'foo',
      value: myState.foo,
      editable: true
    })
  }
})

api.on.editComponentState(payload => {
  if (payload.type === stateType) {
    payload.set(myState)
  }
})
```

As you can see, you should use an object to hold the field value so that it can be assigned to.

### notifyComponentUpdate

If your state has changed, you can tell the devtools to refresh the selected component state with the `notifyComponentUpdate` method:

```js
setInterval(() => {
  api.notifyComponentUpdate()
}, 5000)
```

You can also pass a specific component instance:

```js
api.notifyComponentUpdate(vm)
```

## Custom inspector

Custom inspectors are useful to display debugging information about your library using an inspectable tree.

### addInspector

This function registers a new custom inspector.

The options are:

- `id`: unique custom inspector id
- `label`: label displayed in the `Inspector` sub menu
- `icon` (optional): [Material icon code](https://material.io/resources/icons/), for example `'star'`
- `treeFilterPlaceholder` (optional): placeholder of the filter input above the tree
- `stateFilterPlaceholder` (optional): placeholder of the filter input in the state inspector
- `noSelectionText` (optional): text displayed in the inspector pane when no node is selected
- `actions`: an array of buttons to add to the header of the inspector
  - `icon`: material icon identifier
  - `tooltip`: button tooltip
  - `action`: function to be executed

Example:

```js
const INSPECTOR_ID = 'test-inspector'

api.addInspector({
  id: INSPECTOR_ID,
  label: 'Test inspector',
  icon: 'tab_unselected',
  treeFilterPlaceholder: 'Search for test...',
  actions: [
    {
      icon: 'star',
      tooltip: 'Test custom action',
      action: () => console.log('Meow! 🐱')
    }
  ]
})
```

::: tip
It's recommended to use a variable to put the `id`, so that you can reuse it afterwards.
:::

### on.getInspectorTree

This hook is called when the devtools wants to load the tree of any custom inspector.

You have to put a condition in the callback to target only your inspector:

```js
api.on.getInspectorTree(payload => {
  if (payload.inspectorId === 'test-inspector') {
    // Your logic here
  }
})
```

The `payload` argument:
- `app`: app instance currently active in the devtools
- `inspectorId`: id of the current custom inspector
- `filter`: string of the user input in the search field
- `rootNodes`: array of root nodes of the tree you want to display in the devtools

Each node can have those properties:
- `id`: a unique node id
- `label`: the text displayed in the tree
- `children` (optional): an array of child nodes
- `tags` (optional): an array of tag objects:
  - `label`: text displayed in the tag
  - `textColor`: text color, for example: `0x000000` for black
  - `backgroundColor`: background color, for example: `0xffffff` for white
  - `tooltip` (optional): HTML for a tooltip over the tag

Example:

```js
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

This hook is called when the devtools needs to load the state for the currently selected node in a custom inspector.

You have to put a condition in the callback to target only your inspector:

```js
api.on.getInspectorState(payload => {
  if (payload.inspectorId === 'test-inspector') {
    // Your logic here
  }
})
```

The `payload` argument:
- `app`: app instance currently active in the devtools
- `inspectorId`: id of the current custom inspector
- `nodeId`: id of the currently selected node
- `state`: state sent to the devtools

The state is an object, which keys are the section names in the state inspector, and the value is an array of fields:

```js
payload.state = {
  'section 1': [
    // fields
  ],
  'section 2': [
    // fields
  ]
}
```

Each field is an object with:

- `type`: name of the section under which the field will appear
- `key`: name of the field
- `value`: value of the field
- `editable` (optional): boolean to enable edition

You can also use a [Custom value](#custom-value).

Example:

```js
api.on.getInspectorState(payload => {
  if (payload.inspectorId === 'test-inspector') {
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

If you mark a field as `editable: true`, you should also use this hook to apply the new value sent by the devtools.

You have to put a condition in the callback to target only your inspector:

```js
api.on.editInspectorState(payload => {
  if (payload.inspectorId === 'test-inspector') {
    // Edit logic here
  }
})
```

The `payload` argument:
- `app`: app instance currently active in the devtools
- `inspectorId`: id of the current custom inspector
- `nodeId`: id of the currently selected node
- `type`: the current field type
- `path`: an array of string that represents the property edited by the user. For example, if the user edits the `myObj.myProp.hello` property, the `path` will be `['myObj', 'myProp', 'hello']`.
- `state`: object describing the edit with those properties:
  - `value`: new value
  - `newKey`: string that is set if the key of the value changed, usually when it's in an object
  - `remove`: if `true`, the value should be removed from the object or array
- `set`: an helper function that makes it easy to apply the edit on a state object

Example:

```js
api.on.editInspectorState(payload => {
  if (payload.inspectorId === 'test-inspector') {
    if (payload.nodeId === 'root') {
      payload.set(myState)
    }
  }
})
```

### sendInspectorTree

If you need to update the tree to the user, call this function to ask for a refresh.

Example:

```js
setInterval(() => {
  api.sendInspectorTree('test-inspector')
}, 5000)
```

### sendInspectorState

If you need to update the currently selected node state to the user, call this function to ask for a refresh.

Example:

```js
setInterval(() => {
  api.sendInspectorState('test-inspector')
}, 5000)
```

### selectInspectorNode

Select a specific node in the inspector tree. The arguments are:

- `inspectorId`: the id of your inspector
- `nodeId`: the id of the node to be selected

Example:

```js
api.selectInspectorNode('test-inspector', 'some-node-id')
```

## Timeline

### addTimelineLayer

Register a new timeline layer with this method. The options are:
- `id`: unique id of the layer. It's recommended to use a variable to store it.
- `label`: text displayed in the layer list
- `color`: color of the layer background and event graphics
- `skipScreenshots` (optional): don't trigger a screenshot for the layer events
- `groupsOnly` (optional): only display groups of events (they will be drawn as rectangles)
- `ignoreNoDurationGroups` (optional): skip groups with no duration (useful when `groupsOnly` is `true`)

Example:

```js
api.addTimelineLayer({
  id: 'test-layer',
  label: 'Test layer',
  color: 0x92A2BF
})
```

### addTimelineEvent

Use this function to send a new event on the timeline.
- `layerId`: id of the layer
- `event`: event object
  - `time`: time in millisecond when the event happened
  - `data`: state displayed when selecting the event
  - `title` (optional): text displayed in the event list
  - `subtitle` (optional): secondary text displayed in the event list
  - `logType` (optional): either `'default'`, `'warning'` or `'error'`
  - `meta` (optional): object where you can store metadata about the object that will not be displayed when it's selected
  - `groupId` (optional): id used to group multiple event together

Example:

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

This hook is called when a timline event is selected. It's useful if you want to send additional information to the devtools in a lazy way.

You have to put a condition in the callback to target only your timeline layer:

```js
api.on.inspectTimelineEvent(payload => {
  if (payload.layerId === 'test-layer') {
    // Your logic here
  }
})
```

Example:

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

### on.timelineCleared

This hook is called when the timeline is cleared by the user. Note that clearing the timeline affects all apps and layers simultaneously.

```js
api.on.timelineCleared(() => {
  console.log('timeline is cleared!')
})
```

## Utilities

### getComponentInstances

Component instances on the Vue app.
- `app`: the target Vue app instance

Example:

```js
let componentInstances = []

api.on.getInspectorTree(async (payload) => {
  if (payload.inspectorId === 'test-inspector') { // e.g. custom inspector
    componentInstances = await api.getComponentInstances(app)
      for (const instance of instances) {
      payload.rootNodes.push({
        id: instance.uid.toString(),
        label: `Component ${instance.uid}`
      })
    }

    // something todo ...
  }
})
```

### getComponentBounds

Computes the component bounds on the page.

Example:

```js
api.on.inspectComponent(async payload => {
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

Retrieves the component name.

Example:

```js
api.on.inspectComponent(async payload => {
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

### highlightElement

Highlight the element of the component.
- `instance`: the target component instance

Example:

```js
let componentInstances = [] // keeped component instance of the Vue app (e.g. `getComponentInstances`)

api.on.getInspectorState(payload => {
  if (payload.inspectorId === 'test-inspector') { // e.g. custom inspector
    // find component instance from custom inspector node
    const instance = componentInstances.find(instance => instance.uid.toString() === payload.nodeId)

    if (instance) {
      api.highlightElement(instance)
    }

    // something todo ...
  }
})
```

### unhighlightElement

Unhighlight the element.
- `instance`: the target component instance

Example:

```js
let componentInstances = [] // keeped component instance of the Vue app (e.g. `getComponentInstances`)

api.on.getInspectorState(payload => {
  if (payload.inspectorId === 'test-inspector') { // e.g. custom inspector
    // find component instance from custom inspector node
    const instance = componentInstances.find(instance => instance.uid.toString() === payload.nodeId)

    if (instance) {
      api.unhighlightElement(instance)
    }

    // something todo ...
  }
})
```
