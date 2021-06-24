# Contributing

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
6. Click the "load unpacked" button on the left, and choose the folder: `vue-devtools/packages/shell-chrome/`

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
