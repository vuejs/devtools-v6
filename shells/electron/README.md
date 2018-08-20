# vue-remote-devtools

> This package provides a standalone vue-devtools application that can be used to debug any Vue app, regardless of the environment. You can use it to debug your app opened in a mobile browser, Safari, NativeScript, and more.

## :cd: Installation

Install the package globally:

```bash
npm install -g @vue/devtools
```

Or locally as a project dependency:

```bash
npm install --save-dev @vue/devtools
```

## :rocket: Usage

### As a global package

Once you installed the package globally, run:

```bash
vue-devtools
```

Then add the following snippet to the `<head>` section of your app:

```html
<script src="http://localhost:8098"></script>
```

Or if you want to debug your device remotely:

```html
<script>
  window.__VUE_DEVTOOLS_HOST__ = '<your-local-ip>' // default: localhost
  window.__VUE_DEVTOOLS_PORT__ = '<devtools-port>' // default: 8098
</script>
<script src="http://<your-local-ip>:8098"></script>
```

**Don't forget to remove it before deploying to production!**

`<your-local-ip>` usually looks like this: `192.168.x.x`.

### As a local package

Once you installed the package as a project dependency, run:

```bash
./node_modules/.bin/vue-devtools
```

You can also use the global `vue-devtools` to start the app, but you might want to check if the local version matches the global one in this scenario to avoid any incompatibilities.

Then import it directly in your app:

```js
import devtools from '@vue/devtools'
// import Vue from 'vue'
```

> Make sure to import devtools before Vue, otherwise it might not work as expected.

And connect to the host:

```js
if (process.env.NODE_ENV === 'development') {
  devtools.connect(/* host, port */)
}
```

`host` is an optional argument that tells your application where the devtools middleware server is running. If you debug you app on your computer, you don't have to set this (the default is `http://localhost`), but if you want to debug your app on mobile devices, you might want to set it to your local IP (e.g. `http://192.168.1.12`).

`port` is an optional argument that tells your application on what port the devtools middleware server is running. If you use a proxy server, you might want to set it to `null` so the port won't be added to connection URL.

### FAQ

**1. How do I change the port the devtools server is running on?**

You can change it by setting environment variable before running it:

```bash
PORT=8000 vue-devtools
```

Then, in your app, you'll have to set either:

```js
window.__VUE_DEVTOOLS_PORT__ = 8000
```

Or update the `connect()` function call with the new port:

```js
devtools.connect(/* host */, 8000)
```

**2. How do I inspect pages remotely on a server?**

You can use the [ngrok](https://ngrok.com/) proxy to inspect pages remotely.

After starting vue-devtools, run:

```bash
ngrok http 8098
```

Then update your host and port accordingly:

```js
devtools.connect('https://example.ngrok.io', null)
```

Make sure to set port to `null` or `false`, because the ngrok host already proxies to the proper port we defined in the first command.

**3. How do I inspect pages served through HTTPS?**

For that you can also use ngrok, as it automatically proxies HTTPS requests to HTTP. Take a look at question number 2 for instructions.

**4. How do I inspect Cordova applications?**

Make sure that the page located at `http://your-ip:8098` returns JavaScript code on your device/simulator. If it doesn't, make sure to check your anti-virus or router/firewall settings. If it works, then please follow the instructions, and connect to devtools using your IP. For example:

```js
import devtools from '@vue/devtools'
import Vue from 'vue'
// ...

function onDeviceReady () {
  devtools.connect('http://192.168.xx.yy') // use your IP
}

if (window.location.protocol === 'file:') {
  document.addEventListener('deviceready', onDeviceReady, false)
} else {
  onDeviceReady()
}
```

This will only work in `development` builds of your app.

## :beers: Development

1. Install dependencies:

```bash
npm install
```

2. Run:

```bash
npm run dev
```

This will watch the `src` folder and compile files on changes.

3. Run:

```bash
npm start
```

This will open the Electron app with devtools.

4. Follow the **Usage** section to connect any app to your development version of `vue-remote-devtools`.

## :lock: License

[MIT](http://opensource.org/licenses/MIT)
