<script lang="ts">
import AppHeaderSelect from './AppHeaderSelect.vue'

import { watch, defineComponent } from '@vue/composition-api'
import { useApps } from '@front/features/apps'
import { useOrientation } from '@front/features/layout/orientation'
import { useRouter } from '@front/util/router'

export default defineComponent({
  components: {
    AppHeaderSelect
  },

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
            appId: apps.value[0].id.toString()
          }
        })
      }
    })

    const { orientation } = useOrientation()

    return {
      currentApp,
      apps,
      selectApp,
      orientation
    }
  }
})
</script>

<template>
  <AppHeaderSelect
    :items="apps"
    :selected-item="currentApp"
    option-icon="layers"
    @select="app => selectApp(app.id)"
  >
    <template #trigger>
      <VueButton
        class="flat"
        icon-left="layers"
        :icon-right="orientation === 'landscape' ? 'arrow_drop_down' : null"
        :class="{
          'icon-button': orientation === 'portrait'
        }"
      >
        <template v-if="orientation === 'landscape'">
          <span v-if="currentApp">
            {{ currentApp.name }}
          </span>
          <span
            v-else
            class="opacity-50"
          >
            No app
          </span>
        </template>
      </VueButton>
    </template>

    <template #default="{ item: app }">
      <div class="leading-tight">
        <div class="app-button flex items-center">
          <span class="truncate flex-1">{{ app.name }}</span>
          <span class="opacity-50 flex-none flex items-center">
            <img
              src="~@front/assets/vue-logo.svg"
              class="w-6 h-6 mr-2"
              alt="Vue"
            >
            {{ app.version }}
          </span>
        </div>
        <div
          v-if="app.iframe"
          class="flex items-center space-x-1 text-2xs font-mono text-gray-500"
        >
          <VueIcon
            icon="web"
            class="w-4 h-4"
          />
          <span>{{ app.iframe }}</span>
        </div>
      </div>
    </template>
  </AppHeaderSelect>
</template>

<style lang="postcss" scoped>
.app-button {
  width: 220px;
}
</style>
