# Contributing

Hi! We are really excited that you are interested in contributing to the Vue devtools. Before submitting your contribution, please make sure to take a moment and read through the following guide.

## Monorepo

The repository is a monorepo with several nested packages:

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

1. Clone [this repo](https://github.com/vuejs/devtools)
2. Run `yarn install` in the repository root to install dependencies.
3. Run `yarn run build:watch` (compiles and watch the packages) and then `yarn run dev:vue3` (run the development shell) in two different terminals. Wait for the initial compilation in the first terminal to finish before running the second command.
4. A plain shell with a test app will be available at `http://localhost:8090`.

## Pull Request Guidelines

Thank you for your code contribution! Before opening a PR, please make sure to read the following:

- Checkout a topic branch from a base branch, e.g. `main`, and merge back against that branch. For example: `feat/my-new-feature`.

- Please make sure that you allow maintainers to push changes to your branch when you create your PR.

- If adding a new feature:

  <!-- @TODO Add accompanying test case.-->
  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:

  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `fix: update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR. Live demo preferred.
  <!-- @TODO - Add appropriate test coverage if applicable.-->

- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.

<!-- @TODO - Make sure tests pass!-->

- Commit messages must follow the [commit message convention](https://github.com/vuejs/devtools/blob/main/.github/commit-convention.md) so that changelogs can be automatically generated.

## Running tests

1. Run `yarn lint` to check code quality with ESLint.
2. Run `yarn test` to run all tests. (@TODO)

## Testing as Chrome addon

This is useful when you want to build the extension with the source repo to get not-yet-released features.

1. Clone this repo
2. `cd devtools` the newly created folder
3. run `yarn install`
4. then run `yarn run build:watch` & `yarn run dev:chrome` in parallel
5. Open the Chrome extension page (currently under `Menu` > `More Tools` > `Extensions`)
6. Check "developer mode" on the top-right corner
7. Click the "load unpacked" button on the left, and choose the folder: `devtools/packages/shell-chrome/` (it will have an orange disk icon)
8. Make sure you disable all other versions of the extension

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

## Docs development

1. Clone this repo
2. `cd devtools` the newly created folder
3. run `yarn install`
4. run `docs:dev`
