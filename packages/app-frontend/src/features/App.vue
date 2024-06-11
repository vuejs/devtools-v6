<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import {
  SharedData,
  getStorage,
  isChrome,
  onSharedDataInit,
  setStorage,
  watchSharedData,
} from '@vue-devtools/shared-utils'
import { darkMode } from '@front/util/theme'
import AppHeader from './header/AppHeader.vue'
import AppConnecting from './connection/AppConnecting.vue'
import AppDisconnected from './connection/AppDisconnected.vue'
import ErrorOverlay from './error/ErrorOverlay.vue'
import SplitPane from './layout/SplitPane.vue'
import AppSelectPane from './apps/AppSelectPane.vue'

import { useAppConnection } from './connection'
import { showAppsSelector } from './header/header'
import { useOrientation } from './layout/orientation'

const chromeTheme = isChrome ? chrome.devtools.panels.themeName : undefined

const STORAGE_PREVIOUS_SESSION_THEME = 'previous-session-theme'

export default defineComponent({
  name: 'App',

  components: {
    AppHeader,
    AppConnecting,
    AppDisconnected,
    ErrorOverlay,
    SplitPane,
    AppSelectPane,
  },

  setup() {
    const { isConnected, isInitializing, showDisplayDisconnected, reloadTimes } = useAppConnection()

    function updateTheme(theme: string) {
      if (theme === 'dark' || theme === 'high-contrast' || (theme === 'auto' && chromeTheme === 'dark')) {
        document.body.classList.add('vue-ui-dark-mode')
        document.body.classList.add('dark')
        darkMode.value = true
      }
      else {
        document.body.classList.remove('vue-ui-dark-mode')
        document.body.classList.remove('dark')
        darkMode.value = false
      }
      if (theme === 'high-contrast') {
        document.body.classList.add('vue-ui-high-contrast')
      }
      else {
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

    const { orientation } = useOrientation()

    return {
      isConnected,
      isInitializing,
      showDisplayDisconnected,
      reloadTimes,
      showAppsSelector,
      orientation,
      isChrome,
    }
  },
})
</script>

<template>
  <div
    class="app w-full h-full relative outline-none"
    :class="{
      'disconnected pointer-events-none': !isInitializing && !isConnected,
    }"
    tabindex="0"
  >
    <AppConnecting
      v-if="isInitializing"
      class="absolute inset-0"
    />

    <AppDisconnected
      v-else-if="showDisplayDisconnected"
      class="absolute inset-0"
    />

    <div
      v-else
      :key="reloadTimes"
      class="w-full h-full flex"
      :class="{
        'flex-col': orientation === 'portrait',
      }"
    >
      <AppHeader class="flex-none relative z-10 border-b border-gray-200 dark:border-gray-700" />

      <SplitPane
        save-id="app-select-pane"
        :default-split="12"
        :min="5"
        :max="40"
        collapsable-left
        class="flex-1 overflow-hidden"
        @left-collapsed="showAppsSelector = $event"
      >
        <template #left>
          <AppSelectPane
            class="h-full"
          />
        </template>
        <template #right>
          <router-view class="h-full overflow-auto" />
        </template>
      </SplitPane>
    </div>

    <TeleportTarget id="root" />

    <ErrorOverlay />
  </div>
</template>
