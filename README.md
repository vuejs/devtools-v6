# vue-devtools

### Important Usage Notes

1. If the page uses a production/minified build of Vue.js, devtools inspection is disabled by default so the Vue pane won't show up.

2. To make it work for pages opened via `file://` protocol, you need to check "Allow access to file URLs" for this extension in Chrome's extension management panel.

<p align="center"><img width="600px" src="https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/screenshot.png" alt="demo"></p>

Works with [vuex](https://github.com/vuejs/vuex) for time-travel debugging:

<p align="center"><img width="600px" src="https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/demo.gif" alt="demo"></p>

### Installation

Currently only a Chrome devtools extension is available.

[Get it on the Chrome Web Store](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd).  

[Workaround for Firefox](https://github.com/vuejs/vue-devtools/blob/master/docs/workaround-for-firefox.md)  

### Manual Installation

**Make sure you are using Node 6+ and NPM 3+**

1. Clone this repo
2. `npm install` (Or `yarn install` if you are using yarn as the package manager)
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
