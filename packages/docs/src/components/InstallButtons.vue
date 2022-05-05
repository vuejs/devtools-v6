<script lang="ts" setup>
import InstallButton from './InstallButton.vue'

interface Button {
  label: string
  logo: string
  href: string
  external?: boolean
}

const buttons: Button[] = [
  {
    label: 'Install on Chrome',
    logo: '/logo-chrome.svg',
    href: 'https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd',
    external: true,
  },
  {
    label: 'Install on Firefox',
    logo: '/logo-firefox.svg',
    href: 'https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/',
    external: true,
  },
  {
    label: 'Install on Edge',
    logo: '/logo-edge.png',
    href: 'https://microsoftedge.microsoft.com/addons/detail/vuejs-devtools/olofadcdnkkjdfgjcmjaadnlehnnihnl',
    external: true,
  },
  {
    label: 'Standalone app',
    logo: '/logo-electron.svg',
    href: '#standalone',
  },
]
</script>

<template>
  <div class="flex flex-col gap-2">
    <InstallButton
      v-for="(btn, index) of buttons"
      :key="index"
      v-bind="btn"
    />
  </div>
</template>
