# Releasing Devtools

> This is for maintainers only.

## Pre-requisites

1. Make sure you have publishing rights to the `@vue/devtools` and `@vue/devtools-api` npm packages (check with `npm owner ls @vue/devtools`). If not, ping @yyx990803 for publishing permission.

2. Sign up and create [API keys for Firefox Addons](https://addons.mozilla.org/developers/addon/api/key/). Create `.amo.env.json` in project root with the keys:

    ```json
    {
      "apiKey": "...",
      "apiSecret": "..."
    }
    ```

3. Run `npm run release:beta`.

  If it completes without error, it should have published the necessary npm packages.

  In addition, this should create the following files:

  - `dist/chrome.zip`

    This is the packed chrome extension which should be uploaded via [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole). Note the items are under the `vuejs-dev` publisher group. We current have two extensions, one for beta (currently Vue 3 only) and one for stable (Vue 2 only). We will eventually replace the stable with this branch once it supports both Vue 2 and Vue 3, but for now the Vue 3 supporting version should be published under the beta channel.

  - `distvue.js_devtools-x.x.x.zip`

    Similarly, the stable version of the Firefox Addon can be updated [here](https://addons.mozilla.org/en-US/developers/addon/vue-js-devtools/edit). But before then, we simply publish it as a pre-signed zip file. It should be added as a binary to the GitHub release.

4. The release should have updated the versions of a few `package.json` files. Add and commit them, then add a git tag in the format of `v6.x.x`. Push both the commit and the tag to GitHub, and publish the release on GitHub (we should probably automate this with local script + GitHub actions).
