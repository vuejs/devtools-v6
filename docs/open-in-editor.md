# Open component in editor

In your Vue project, install the [express-open-in-editor](https://github.com/lahmatiy/express-open-in-editor) package and modifiy your webpack configuration:

1. Import the package:

```js
var openInEditor = require('express-open-in-editor')
```

2. In the `devServer` option, register the `/_open` HTTP route:

```js
devServer: {
  before (app) {
    app.use('/_open', openInEditor({
      editor: 'code'
    }))
  }
}
```

3. You can change `'code'` with the editor you are using, see the [supported editors list](https://github.com/lahmatiy/open-in-editor#editor).

You can now click on the name of the component in the Component inspector pane (if the devtools knows about its file source, a tooltip will appear).
