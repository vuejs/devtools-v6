# vue-remote-devtools

> This package provides a standalone vue-devtools application, that can be used to debug any Vue app regardless of the environment. Now you can debug your app opened in mobile browser, safari, native script etc. not just desktop chrome or firefox.

### :cd: Installation

Install the package globally:
```bash
npm install -g vue-remote-devtools
```

### :rocket: Usage

Once you installed the package globally, run:
```bash
vue-remote-devtools
```

Then add:
```html
<script src="http://localhost:8098"></script>
```
To the `<head>` section of your app. 
**(Don't forget to remove it before deploying to production!)**

Alternatively you can also install `vue-remote-devtools` as project dependency:
```bash
npm install vue-remote-devtools --save-dev
```

And then directly import it in your app:
```js
import devtools from 'vue-remote-devtools'

if (process.env.NODE_ENV === 'development') {
  devtools.connect()
}
```

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
