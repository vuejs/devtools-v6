# Open component in editor

## Nuxt.js

Nuxt supports this feature out-of-the-box. Make sure to be in debug mode.

## Webpack

In your Vue project, install the [express-open-in-editor](https://github.com/lahmatiy/express-open-in-editor) package and modifiy your webpack configuration:

1. Import the package:

```js
var openInEditor = require('express-open-in-editor')
```

2. In the `devServer` option, register the `/__open-in-editor` HTTP route:

```js
devServer: {
  before (app) {
    app.use('/__open-in-editor', openInEditor({
      editor: 'code'
    }))
  }
}
```

3. You can change `'code'` with the editor you are using, see the [supported editors list](https://github.com/lahmatiy/open-in-editor#editor).

You can now click on the name of the component in the Component inspector pane (if the devtools knows about its file source, a tooltip will appear).

## Node.js

You can use the [open-in-editor](https://github.com/lahmatiy/open-in-editor) package to setup an HTTP route with the `/__open-in-editor` path. It will receive `file` as an URL variable.
