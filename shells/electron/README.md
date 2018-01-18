# vue-remote-devtools

> This package provides a standalone vue-devtools application, that can be used to debug any Vue app regardless of the environment. Now you can debug your app opened in mobile browser, safari, native script etc. not just desktop chrome or firefox.

### :cd: Installation

Install the package globally:
```bash
npm install -g @vue/devtools
```

Or locally as project dependency:
```bash
npm install --save-dev @vue/devtools
```

### :rocket: Usage

#### Using global package

Once you installed the package globally, run:
```bash
vue-devtools
```

Then add:
```html
<script src="http://localhost:8098"></script>
```

Or if you want to debug your device remotely:
```html
<script>
  window.__VUE_DEVTOOLS__HOST = '<your-local-ip>'
</script>
<script src="http://<your-local-ip>:8098"></script>
```

To the `<head>` section of your app. 
**(Don't forget to remove it before deploying to production!)**

`<your-local-ip>` usually looks like this: `192.168.x.x`.

#### Using dependency package

Once you installed the package as project dependency, run:
```bash
./node_modules/.bin/vue-devtools
```

You can also use the global `vue-devtools` to start the app, but you might want to check if the local version matches the global one in this scenario to avoid any incompatibilities.

Then import it directly in your app:
```js
import devtools from '@vue/devtools'
// import Vue from 'vue'
```
> Make sure you import devtools before Vue, otherwise it might not work as expected.

And connect to host:
```js
if (process.env.NODE_ENV === 'development') {
  devtools.connect(/* host */)
}
```

**host** - is an optional argument that tells your application where devtools middleware server is running, if you debug you app on your computer you don't have to set this (the default is `http://localhost`), but if you want to debug your app on mobile devices, you might want to pass your local IP (e.g. `192.168.1.12`).

### :beers: Development

1. Install all dependencies
```
npm install
```

2. Run:
```
npm run dev
```
This will watch `src` folder and compile files on change

3. Run:
```
npm start
```
This will open electron app with devtools

4. Follow **Usage** section to connect any app to your development version of `vue-remote-devtools`

### :lock: License

[MIT](http://opensource.org/licenses/MIT)
