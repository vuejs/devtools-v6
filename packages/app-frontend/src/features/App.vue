<script>
import AppHeader from './header/AppHeader.vue'
import AppConnecting from './connection/AppConnecting.vue'
import AppDisconnected from './connection/AppDisconnected.vue'
import ErrorOverlay from './error/ErrorOverlay.vue'
import { useAppConnection } from './connection'

export default {
  name: 'App',

  components: {
    AppHeader,
    AppConnecting,
    AppDisconnected,
    ErrorOverlay
  },

  setup () {
    const { isConnected, isInitializing } = useAppConnection()

    return {
      isConnected,
      isInitializing
    }
  }
}
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
      <AppHeader class="flex-none" />

      <router-view class="flex-1 overflow-auto" />
    </template>

    <ErrorOverlay />
  </div>
</template>
