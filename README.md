# vue-devtools

<p align="center"><img width="720px" src="https://raw.githubusercontent.com/vuejs/vue-devtools/dev/media/screenshot-shadow.png" alt="screenshot"></p>

## Installation

- [Get the Chrome Extension](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) / ([beta channel](https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg))

- [Get the Firefox Addon](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) / ([beta channel](https://github.com/vuejs/vue-devtools/releases))

- [Get standalone Electron app (works with any environment!)](./packages/shell-electron/README.md)

### Important Usage Notes

1. If the page uses a production/minified build of Vue.js, devtools inspection is disabled by default so the Vue pane won't show up.

2. To make it work for pages opened via `file://` protocol, you need to check "Allow access to file URLs" for this extension in Chrome's extension management panel.

3. The **events tab** only show custom events emitted by a component. More information on custom events can be found [in the documentation](https://vuejs.org/v2/guide/components-custom-events.html).

### Open component in editor

To enable this feature, follow [this guide](./docs/open-in-editor.md).

### Manual Installation

This is only necessary when you want to build the extension yourself from source to get not-yet-released features.

**Make sure you are using Node 6+ and NPM 3+**

1. Clone this repo
2. `cd vue-devtools` the newly created folder
3. run `yarn install`
4. then run `yarn run build`
5. Open the Chrome extension page (currently under Menu > More Tools > Extensions)
6. Check "developer mode" on the top-right corner
7. Click the "load unpacked" button on the left, and choose the folder: `vue-devtools/packages/shell-chrome/`
8. Alternatilvely to step 3, you can also use `yarn dev:chrome` to build & watch the unpacked extension

### Development

#### Vue 2

1. Clone this repo
2. run `yarn install`
3. then run `yarn run dev`
4. A plain shell with a test app will be available at `localhost:8100`.

#### Vue 3

To enable this feature, follow [this guide](./docs/devtools-vue3.md).

### Testing as Firefox addon

1.  Install `web-ext`

    ```
    $ yarn global add web-ext
    ```

    Also, make sure `PATH` is set up. Something like this in `~/.bash_profile`:

    ```
    $ PATH=$PATH:$(yarn global bin)
    ```

2.  Build and run in Firefox

    ```
    $ yarn run build
    $ yarn run run:firefox
    ```

### Force enable the devtools

```js
// Before you create app
Vue.config.devtools = process.env.NODE_ENV === 'development'

// After you create app
window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app.constructor

// then had to add in ./store.js as well.
Vue.config.devtools = process.env.NODE_ENV === 'development'
```

### Common problems and how to fix

1. Fixing "Download the Vue Devtools for a better development experience" console message when working locally over `file://` protocol:
   1.1 - Google Chrome: Right click on vue-devtools icon and click "Manage Extensions" then search for vue-devtools on the extensions list. Check the "Allow access to file URLs" box.

2. How to use the devtools in IE/Edge/Safari or any other browser? [Get the standalone Electron app (works with any environment!)](./packages/shell-electron/README.md)

### License

[MIT](http://opensource.org/licenses/MIT)
