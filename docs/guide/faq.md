# Frenquently Asked Questions

## How to use the devtools in IE/Edge/Safari or any other browser?

In case your browser doesn't have our browser extension available, we made a standalone Vue devtools application.
[Get it now!](./open-in-editor.md)

## When opening an HTML file directly

Fixing "Download the Vue Devtools for a better development experience" console message when working locally over `file://` protocol:
- Google Chrome: Right click on vue-devtools icon and click "Manage Extensions" then search for vue-devtools on the extensions list. Check the "Allow access to file URLs" box.

## The Vue devtools don't show up

Here are some troubleshooting steps to help you if you don't the Vue devtools in your browser:

- Check if you have the extension [installed](./installation.md).
- If you are on a live website, there is a good chance it's using a production build of Vue.
  - Use a non-minified, non-`prod` version of Vue on CDN
  - Set the `__VUE_PROD_DEVTOOLS__` environment variable for Vue 3 when using a bundler like Webpack ([more info](https://github.com/vuejs/vue-next/tree/master/packages/vue#bundler-build-feature-flags)).
- Try closing the devtools pane, refreshing the page and opening the devtools pane again.
- Try restarting the browser or the computer.
- If you have multiple versions of the Vue devtools installed, it's recommended to disable/remove the others.
- Try disabling other devtools extensions like React devtools.
- Look for errors in the browser Console.
- Update your project dependencies.
- Even if the Vue logo in the toolbar is gray and says "Vue not detected", open your browser devtools and check if the Vue tab is showing up anyaway.

## The data isn't updating in the component inspector

Make sure your data is used somewhere in your templates. Vue uses a lazy reactivity system for performance reasons, so the devtools could read some component data but Vue might not trigger updates on it as you would expect.

You can also click on the `Force refresh` button at the top of the devtools to do a manual refresh of the component data.

## A weird gray overlay is displayed on my page when I move the mouse in the timeline

By default, the devtools will try to take screenshots of your application when something happens on the Timeline. But it can fail for various reasons (such as undocking the devtools pane on Chrome). In that case, you can turn the screenshots off by opening the 'More' menu on the top right of the devtools (three vertical dots).

## Some package is polluting my devtools

The new Vue devtools feature a powerful public API so that package authors can integrate with the devtools (for example vuex or pinia). Since great power comes with great responsibility, you can disable specific permissions of a plugin, or even turn it off entirely, by going to the 'More' menu (three vertical dots on the top right), and then 'Devtools plugins...'.

## Something is broken in the new devtools

If something is very broken, please submit a new issue! In the mean time, you can install the legacy version of the devtools:

- [Chrome](https://chrome.google.com/webstore/detail/iaajmlceplecbljialhhkmedjlpdblhp/)
- [Firefox](https://github.com/vuejs/vue-devtools/releases/download/v5.3.3/vuejs_devtools-5.3.4-fx.xpi)

Make sure you disable any other versions of the Vue devtools.
