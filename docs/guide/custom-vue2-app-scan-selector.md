## Customize vue2 app scan selector
> For example, if you are using micro-app as your micro-frontend framework, the devtools cannot find Vue2 apps in `<micro-app>` by default.

You can set a custom selector used to scan for Vue2 apps in your project with the following code in your frontend app:

```js
if (process.env.NODE_ENV !== 'production') {
  window.VUE_DEVTOOLS_CONFIG = {
    customVue2ScanSelector: 'micro-app'
  }
}
```