# vue-devtools

### Important Usage Notes

1. vue-devtools only works with Vue.js 1.0.0+.

2. After installation, there will be a grayed-out icon to the right of your omnibar. **It doesn't do anything.** Chrome team made this questionable design decision to display the icon even if an extension doesn't define any browser actions at all, and it's not possible to programmatically open the devtools pane for you from an extension. **You need to open the devtools and navigate to the Vue pane yourself.**

3. The Vue pane only appears if Vue.js is detected on the page. **If the page uses a production/minified build of Vue.js, devtools inspection is disabled by default so the Vue pane won't show up.**

4. To make it work for pages opened via `file://` protocol, you need to check "Allow access to file URLs" for this extension in Chrome's extension management panel.

![screenshot](https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/screenshot.png)

Works with [vuex](https://github.com/vuejs/vuex) for time-travel debugging:

<p align="center"><img src="https://raw.githubusercontent.com/vuejs/vue-devtools/master/media/demo.gif" alt="demo"></p>

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
