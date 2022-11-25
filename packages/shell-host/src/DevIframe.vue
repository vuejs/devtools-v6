<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { Bridge } from '@vue-devtools/shared-utils'
import { initDevTools } from '@front'
import { installHook } from '@back/hook'

const STORAGE_URL = 'vue-devtools.dev-iframe.url'

export default defineComponent({
  setup () {
    const src = ref(localStorage.getItem(STORAGE_URL) ?? 'target.html')
    const url = ref(src.value)
    const iframe = ref(null)
    const loading = ref(true)
    const error = ref(false)

    watch(src, (value) => {
      localStorage.setItem(STORAGE_URL, value)
    })

    function inject (src, done) {
      if (!src || src === 'false') {
        return done()
      }
      const script = iframe.value.contentDocument.createElement('script')
      script.src = src.replace(/\$ORIGIN/g, location.origin)
      script.onload = done
      iframe.value.contentDocument.body.appendChild(script)
    }

    function onLoad () {
      loading.value = false
      try {
        console.log('%cInstalling hook...', 'color:#42B983;')
        installHook(iframe.value.contentWindow)

        let loadListener

        // 2. init devtools
        console.log('%cInit devtools...', 'color:#42B983;')
        initDevTools({
          connect (cb) {
            // 3. called by devtools: inject backend
            console.log('%cInjecting backend...', 'color:#42B983;')
            inject('$ORIGIN/target/backend.js', () => {
              // 4. send back bridge
              console.log('%cInit bridge...', 'color:#42B983;')
              cb(new Bridge({
                listen (fn) {
                  iframe.value.contentWindow.parent.addEventListener('message', evt => fn(evt.data))
                },
                send (data) {
                  if (process.env.NODE_ENV !== 'production') {
                    console.log('%cdevtools -> backend', 'color:#888;', data)
                  }
                  iframe.value.contentWindow.postMessage(data, '*')
                },
              }))
            })
          },
          onReload (reloadFn) {
            loadListener = reloadFn
          },
        })

        iframe.value.contentWindow.addEventListener('unload', () => {
          if (loadListener) loadListener()
          loading.value = true
        })
      } catch (e) {
        console.error(e)
        error.value = true
      }
    }

    function openUrl () {
      let value = url.value
      if (value === src.value) {
        reload()
      } else {
        if (!value.startsWith('http')) {
          value = `http://${value}`
        }
        src.value = value
        url.value = value
      }
    }

    function reload () {
      iframe.value.contentWindow.location.reload()
    }

    function reset () {
      src.value = 'target.html'
    }

    const includeCode = `&lt;script src="${location.origin}/target/hook.js"&gt;&lt;/script&gt;`

    return {
      src,
      url,
      loading,
      openUrl,
      iframe,
      onLoad,
      reset,
      error,
      includeCode,
    }
  },
})
</script>

<template>
  <div class="dev-iframe flex-1 flex flex-col">
    <iframe
      id="target"
      ref="iframe"
      name="target"
      class="flex-1 border-none"
      data-vue-devtools-ignore
      :src="src"
      @load="onLoad"
    />
    <div class="border-t border-gray-300 flex relative">
      <VueLoadingBar
        v-if="loading"
        class="primary ghost absolute left-0 top-0 w-full"
        unknown
      />

      <VueInput
        v-model="url"
        name="url"
        placeholder="Enter target URL..."
        class="min-w-0 flex-1 flat"
        @keyup.enter="openUrl()"
      />

      <VueButton
        v-tooltip="'Refresh page'"
        icon-left="refresh"
        class="icon-button flat"
        @click="openUrl()"
      />

      <VueButton
        v-tooltip="'Reset URL'"
        icon-left="backspace"
        :disabled="src === 'target.html'"
        class="icon-button flat"
        @click="reset()"
      />

      <VueDropdown
        :offset="[0, 0]"
      >
        <template #trigger>
          <VueButton
            v-tooltip="'Help'"
            icon-left="help"
            class="icon-button flat"
          />
        </template>

        <div class="p-8">
          <p>
            You need to <a
              href="https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome"
              target="_blank"
              class="text-green-500"
            >disable Chrome web security</a> to allow manipulating an iframe on a different origin.
          </p>
          <pre class="my-2 p-2 rounded bg-gray-100 dark:bg-gray-900 text-sm">google-chrome --disable-web-security --disable-site-isolation-trials --user-data-dir="temp-chrome-data"</pre>
          <p>If the devtools have trouble connecting to the webpage, please put this snippet in the target app HTML before the main scripts:</p>
          <pre
            class="my-2 p-2 rounded bg-gray-100 dark:bg-gray-900 text-sm"
            v-html="includeCode"
          />
        </div>
      </VueDropdown>
    </div>

    <VueModal
      v-if="error"
      title="Error"
      @close="error = false"
    >
      <div class="p-6">
        Please <a
          href="https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome"
          target="_blank"
          class="text-green-500"
        >disable Chrome web security</a> to allow manipulating an iframe on a different origin.
        <pre class="my-2 p-2 rounded bg-gray-100 dark:bg-gray-900 text-sm">google-chrome --disable-web-security --disable-site-isolation-trials --user-data-dir="temp-chrome-data"</pre>
      </div>
    </VueModal>
  </div>
</template>
