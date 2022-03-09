# vue-devtools

![screenshot](./media/screenshot-shadow.png)

[Documentation](https://devtools.vuejs.org/)

## Monorepo

|Package|Description|
|-------|-----------|
[api](./packages/api) | The public devtools API that can be installed in Vue plugins |
[app-backend-api](./packages/app-backend-api) | Abstract API to link the Public API, the core and Vue handlers |
[app-backend-core](./packages/app-backend-core) | The main logic injected in the page to interact with Vue apps |
[app-backend-vue1](./packages/app-backend-vue1) | Decoupled handlers to support Vue 1 (soon) |
[app-backend-vue2](./packages/app-backend-vue2) | Decoupled handlers to support Vue 2 |
[app-backend-vue3](./packages/app-backend-vue3) | Decoupled handlers to support Vue 3 |
[app-frontend](./packages/app-frontend) | Vue app displayed in the browser devtools pane |
[shell-chrome](./packages/shell-chrome) | Chrome/Firefox extension |
[shell-electron](./packages/shell-electron) | Electron standalone app |
[shell-host](./packages/shell-host) | Development environment |
[shell-dev-vue2](./packages/shell-dev-vue2) | Demo app for development (Vue 2) |
[shell-dev-vue3](./packages/shell-dev-vue3) | Demo app for development (Vue 3) |

## Contributing

See the [Contributing guide](https://devtools.vuejs.org/guide/contributing.html).

## License

[MIT](http://opensource.org/licenses/MIT)

## Sponsors

[💚️ Become a Sponsor](https://github.com/sponsors/Akryum)

<p align="center">
  <a href="https://guillaume-chau.info/sponsors/" target="_blank">
    <img src='https://akryum.netlify.app/sponsors.svg'/>
  </a>
</p>
