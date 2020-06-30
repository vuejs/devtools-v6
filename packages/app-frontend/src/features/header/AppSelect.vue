<script>
import { watch } from '@vue/composition-api'
import { useRouter } from '@front/util/router'
import { useApps } from '../apps'

export default {
  setup () {
    const router = useRouter()

    const {
      apps,
      currentAppId,
      currentApp,
      selectApp
    } = useApps()

    watch(apps, () => {
      if (!currentApp.value && apps.value.length && currentAppId.value !== apps.value[0].id) {
        router.push({
          params: {
            appId: apps.value[0].id
          }
        })
      }
    })

    return {
      currentApp,
      apps,
      selectApp
    }
  }
}
</script>

<template>
  <VueDropdown
    placement="bottom-start"
  >
    <template #trigger>
      <VueButton
        v-tooltip="'Select current app'"
        class="flat"
        icon-left="web_asset"
        icon-right="arrow_drop_down"
      >
        <span v-if="currentApp">
          {{ currentApp.name }}
        </span>
        <span
          v-else
          class="opacity-50"
        >
          No app
        </span>
      </VueButton>
    </template>

    <VueDropdownButton
      v-for="app of apps"
      :key="app.id"
      icon-left="web_asset"
      @click="selectApp(app.id)"
    >
      <div class="app-button flex">
        <span class="truncate flex-1">{{ app.name }}</span>
        <span class="opacity-50 flex-none flex items-center">
          <img
            src="~@front/assets/logo.png"
            class="w-4 h-4 mr-2"
            alt="Vue"
          >
          {{ app.version }}
        </span>
      </div>
    </VueDropdownButton>
  </VueDropdown>
</template>

<style lang="postcss" scoped>
.app-button {
  width: 220px;
}
</style>
