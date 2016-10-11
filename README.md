# vue-devtools

![screenshot](https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/screenshot.png)

Works with [vuex](https://github.com/vuejs/vuex) for time-travel debugging:

<p align="center"><img src="https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/demo.gif" alt="demo"></p>

### NOTES

1. vue-devtools only works with Vue.js 1.0.0+.

2. For Vue version < 1.0.16, The devtool will only work with development (non-minified) versions of Vue, because the devtools hooks are stripped in production builds. This also includes builds produced by Webpack and Browserify in production mode. 
 
3. Vue 1.0.16 and 1.0.17 works with devtools in all cases.

4. Vue 1.0.18+ devtools hooks are now disabled in production builds by default. However, you can explicitly enable it by setting:`Vue.config.devtools = true`

5. To make it work for pages opened via `file://` protocol, you need to check "Allow access to file URLs" for this extension in Chrome's extension management panel.

### Installation

Currently only a Chrome devtools extension is available.

[Get it on the Chrome Web Store](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd).

### Manual Installation

**Make sure you are using Node 6+ and NPM 3+**

1. Clone this repo
2. `npm install`
3. `npm run build`
4. Open Chrome extension page
5. Check "developer mode"
6. Click "load unpacked extension", and choose `shells/chrome`.

### Hacking

1. Clone this repo
2. `npm install`
3. `npm run dev`
4. A plain shell with a test app will be available at `localhost:8080`.

### License

[MIT](http://opensource.org/licenses/MIT)
