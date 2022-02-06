<script lang="ts">
import AppHeader from './header/AppHeader.vue'
import AppConnecting from './connection/AppConnecting.vue'
import AppDisconnected from './connection/AppDisconnected.vue'
import ErrorOverlay from './error/ErrorOverlay.vue'
import WelcomeSlideshow from './welcome/WelcomeSlideshow.vue'

import { onMounted, defineComponent, ref, watch } from '@vue/composition-api'
import {
  isChrome,
  setStorage,
  getStorage,
  SharedData,
  watchSharedData,
  onSharedDataInit,
} from '@vue-devtools/shared-utils'
import { darkMode } from '@front/util/theme'
import { useAppConnection } from './connection'

const chromeTheme = isChrome ? chrome.devtools.panels.themeName : undefined

const STORAGE_PREVIOUS_SESSION_THEME = 'previous-session-theme'
const STORAGE_WELCOME_HIDDEN = 'welcome-hidden'

export default defineComponent({
  name: 'App',

  components: {
    AppHeader,
    AppConnecting,
    AppDisconnected,
    ErrorOverlay,
    WelcomeSlideshow,
  },

  setup () {
    const { isConnected, isInitializing } = useAppConnection()

    function updateTheme (theme: string) {
      if (theme === 'dark' || theme === 'high-contrast' || (theme === 'auto' && chromeTheme === 'dark')) {
        document.body.classList.add('vue-ui-dark-mode')
        document.body.classList.add('dark')
        darkMode.value = true
      } else {
        document.body.classList.remove('vue-ui-dark-mode')
        document.body.classList.remove('dark')
        darkMode.value = false
      }
      if (theme === 'high-contrast') {
        document.body.classList.add('vue-ui-high-contrast')
      } else {
        document.body.classList.remove('vue-ui-high-contrast')
      }
      setStorage(STORAGE_PREVIOUS_SESSION_THEME, theme)
    }

    onSharedDataInit(() => {
      updateTheme(SharedData.theme)
    })

    watchSharedData('theme', (value) => {
      updateTheme(value)
    })

    onMounted(() => {
      // Apply last session theme to prevent flashes of different theme
      const previousTheme = getStorage(STORAGE_PREVIOUS_SESSION_THEME)
      if (previousTheme) {
        updateTheme(previousTheme)
      }
    })

    const welcomeHidden = ref<boolean>(getStorage(STORAGE_WELCOME_HIDDEN))
    watch(welcomeHidden, (value) => {
      setStorage(STORAGE_WELCOME_HIDDEN, value)
    })

    return {
      isConnected,
      isInitializing,
      welcomeHidden,
    }
  },
})
</script>

<template>
  <div
    class="app w-full h-full flex flex-col relative"
    :class="{
      'disconnected pointer-events-none': !isInitializing && !isConnected
    }"
  >
    <AppConnecting
      v-if="isInitializing"
      class="absolute inset-0"
    />

    <AppDisconnected
      v-else-if="!isConnected"
      class="absolute inset-0"
    />

    <template v-else>
      <AppHeader class="flex-none relative z-10 border-b border-gray-200 dark:border-gray-800" />

      <router-view class="flex-1 overflow-auto" />
    </template>

    <portal-target name="root" />

    <ErrorOverlay />

    <WelcomeSlideshow
      v-if="!welcomeHidden"
      class="absolute inset-0 z-100"
      @hide="welcomeHidden = true"
    />
  </div>
</template>
