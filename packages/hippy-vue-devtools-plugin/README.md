# `@hippy/hippy-vue-devtools-plugin`

> support vue devtools in Hippy

## Usage

```js
const hippyVueDevtoolsPlugin = require('@hippy/hippy-vue-devtools-plugin');

module.exports = {
  // add this plugin to webpack config
  plugins: [
    new InjectVueDevtoolsPlugin({
      protocol: 'http',
      host: 'localhost',
      port: 38989,
    }),
  ],
  // or use @hippy/debug-server-next to auto enable this plugin
  devServer: {
    remote: {
      protocol: 'http',
      host: 'localhost',
      port: 38989,
    },
    vueDevtools: true,
  }
}
```
