<script lang="ts">
import AppHeaderSelect from './AppHeaderSelect.vue'

import { watch, defineComponent } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'
import { useApps } from '@front/features/apps'
import { useOrientation } from '@front/features/layout/orientation'
import { useRouter } from '@front/util/router'
import { useBridge } from '../bridge'

export default defineComponent({
  components: {
    AppHeaderSelect
  },

  setup () {
    const router = useRouter()
    const { bridge } = useBridge()

    const {
      apps,
      currentAppId,
      currentApp,
      selectApp
    } = useApps()

    watch(currentAppId, value => {
      bridge.send(BridgeEvents.TO_BACK_APP_SELECT, value)
    }, {
      immediate: true
    })

    watch(apps, () => {
      if (!currentApp.value && apps.value.length) {
        let targetId: string
        if (SharedData.pageConfig?.defaultSelectedAppId) {
          targetId = SharedData.pageConfig.defaultSelectedAppId
        } else if (currentAppId.value !== apps.value[0].id) {
          targetId = apps.value[0].id
        }
        if (targetId) {
          router.push({
            params: {
              appId: apps.value[0].id.toString()
            }
          })
        }
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
    @select="app => selectApp(app.id)"
  >
    <template #trigger>
      <VueButton
        class="flat"
        icon-left="wysiwyg"
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
          <span class="flex-none flex items-center">
            <img
              src="~@front/assets/vue-logo.svg"
              class="w-6 h-6"
              alt="Vue"
            >
            <span>{{ app.version }}</span>
          </span>

          <template v-if="$shared.debugInfo">
            <span
              v-tooltip="'id'"
              class="text-white px-1 rounded bg-gray-500 mx-1"
            >
              {{ app.id }}
            </span>
          </template>
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
