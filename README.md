# vue-devtools

![screenshot](https://raw.githubusercontent.com/vuejs/vue-devtools/master/screenshot.png)

### NOTES

1. The new vue-devtools only works with Vue.js 1.0.0+.

2. The devtool will only work with non-minified versions of Vue, because the devtools hooks are stripped in production builds. This also includes builds produced by Webpack and Browserify in production mode.

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
