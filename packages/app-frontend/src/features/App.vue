<script>
import AppHeader from './header/AppHeader.vue'
import AppConnecting from './connection/AppConnecting.vue'
import { useAppConnection } from './connection'

export default {
  name: 'App',

  components: {
    AppHeader,
    AppConnecting
  },

  setup () {
    const { isConnected } = useAppConnection()

    return {
      isConnected
    }
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col relative">
    <AppConnecting
      v-if="!isConnected"
      class="absolute inset-0"
    />

    <template v-else>
      <AppHeader class="flex-none" />

      <router-view class="flex-1 overflow-auto" />
    </template>
  </div>
</template>
