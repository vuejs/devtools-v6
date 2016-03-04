# vue-devtools

![screenshot](https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/screenshot.png)

Works with [vuex](https://github.com/vuejs/vuex) for time-travel debugging:

<p align="center"><img src="https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/demo.gif" alt="demo"></p>

### NOTES

1. vue-devtools only works with Vue.js 1.0.0+.

2. Devtools cannot access pages via `file://` protocol. You need to serve the page over HTTP in order to use it.

3. For Vue version < 1.0.16, The devtool will only work with development (non-minified) versions of Vue, because the devtools hooks are stripped in production builds. This also includes builds produced by Webpack and Browserify in production mode. Vue >= 1.0.16 works with the devtools in all cases.

### Installation

Currently only a Chrome devtools extension is available.

[Get it on the Chrome Web Store](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd).

### Manual Installation

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
