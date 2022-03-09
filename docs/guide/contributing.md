# Contributing

## Monorepo

|Package|Description|
|-------|-----------|
[api](https://github.com/vuejs/devtools/tree/main/packages/api) | The public devtools API that can be installed in Vue plugins |
[app-backend-api](https://github.com/vuejs/devtools/tree/main/packages/app-backend-api) | Abstract API to link the Public API, the core and Vue handlers |
[app-backend-core](https://github.com/vuejs/devtools/tree/main/packages/app-backend-core) | The main logic injected in the page to interact with Vue apps |
[app-backend-vue1](https://github.com/vuejs/devtools/tree/main/packages/app-backend-vue1) | Decoupled handlers to support Vue 1 (soon) |
[app-backend-vue2](https://github.com/vuejs/devtools/tree/main/packages/app-backend-vue2) | Decoupled handlers to support Vue 2 |
[app-backend-vue3](https://github.com/vuejs/devtools/tree/main/packages/app-backend-vue3) | Decoupled handlers to support Vue 3 |
[app-frontend](https://github.com/vuejs/devtools/tree/main/packages/app-frontend) | Vue app displayed in the browser devtools pane |
[shell-chrome](https://github.com/vuejs/devtools/tree/main/packages/shell-chrome) | Chrome/Firefox extension |
[shell-electron](https://github.com/vuejs/devtools/tree/main/packages/shell-electron) | Electron standalone app |
[shell-host](https://github.com/vuejs/devtools/tree/main/packages/shell-host) | Development environment |
[shell-dev-vue2](https://github.com/vuejs/devtools/tree/main/packages/shell-dev-vue2) | Demo app for development (Vue 2) |
[shell-dev-vue3](https://github.com/vuejs/devtools/tree/main/packages/shell-dev-vue3) | Demo app for development (Vue 3) |


## Development

1. Clone this repo
2. run `yarn install`
3. then run `yarn run build:watch` and `yarn run dev:vue3` in parallel
4. A plain shell with a test app will be available at [localhost:8090](http://localhost:8090/).

## Testing as Chrome addon

This is useful when you want to build the extension with the source repo to get not-yet-released features.

1. Clone this repo
2. `cd vue-devtools` the newly created folder
2. run `yarn install`
3. then run `yarn run build:watch` & `yarn run dev:chrome` in parallel
4. Open the Chrome extension page (currently under `Menu` > `More Tools` > `Extensions`)
5. Check "developer mode" on the top-right corner
6. Click the "load unpacked" button on the left, and choose the folder: `vue-devtools/packages/shell-chrome/` (it will have an orange disk icon)
7. Make sure you disable all other versions of the extension

## Testing as Firefox addon

1. Install `web-ext`

  ~~~~
  $ yarn global add web-ext
  ~~~~

  Also, make sure `PATH` is set up. Something like this in `~/.bash_profile`:

  ~~~~
  $ PATH=$PATH:$(yarn global bin)
  ~~~~

2. Clone this repo
3. run `yarn install`
4. then run `yarn run build:watch` and `yarn run dev:chrome` in parallel
5. run `yarn run:firefox`
