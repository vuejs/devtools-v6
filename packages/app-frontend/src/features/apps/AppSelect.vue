<script lang="ts">
import AppHeaderSelect from '../header/AppHeaderSelect.vue'
import AppSelectItem from './AppSelectItem.vue'

import { watch, defineComponent, computed } from 'vue'
import { BridgeEvents, SharedData } from '@vue-devtools/shared-utils'
import { useApps, pendingSelectAppId, scanLegacyApps } from '@front/features/apps'
import { useOrientation } from '@front/features/layout/orientation'
import { useRouter } from '@front/util/router'
import { useBridge } from '../bridge'
import { useVueVersionCheck } from './vue-version-check'

export default defineComponent({
  components: {
    AppHeaderSelect,
    AppSelectItem,
  },

  setup () {
    const router = useRouter()
    const { bridge } = useBridge()

    const {
      apps,
      currentAppId,
      currentApp,
      selectApp,
    } = useApps()

    watch(currentAppId, value => {
      if (pendingSelectAppId.value !== value) {
        pendingSelectAppId.value = value
        bridge.send(BridgeEvents.TO_BACK_APP_SELECT, value)
      }
    }, {
      immediate: true,
    })

    let initDefaultAppId = false

    watch(apps, () => {
      if ((!currentApp.value || (SharedData.pageConfig?.defaultSelectedAppId && !initDefaultAppId)) && apps.value.length) {
        let targetId: string
        if (SharedData.pageConfig?.defaultSelectedAppId) {
          targetId = SharedData.pageConfig.defaultSelectedAppId
          initDefaultAppId = true
        } else if (currentAppId.value !== apps.value[0].id) {
          targetId = apps.value[0].id
        }
        if (targetId) {
          router.push({
            params: {
              appId: targetId,
              componentId: null,
            },
          })
        }
      }
    }, {
      immediate: true,
    })

    const { orientation } = useOrientation()

    // Vue version
    const { getLatestVersion } = useVueVersionCheck()
    const hasNewVueVersion = computed(() => apps.value.some(app => app.version !== getLatestVersion(app.version)))

    return {
      currentApp,
      apps,
      selectApp,
      orientation,
      hasNewVueVersion,
      scanLegacyApps,
    }
  },
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
        <div class="flex items-center space-x-2">
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

          <VueIcon
            v-if="hasNewVueVersion"
            icon="new_releases"
            class="text-green-500"
          />
        </div>
      </VueButton>
    </template>

    <template #default="{ item }">
      <AppSelectItem
        :app="item"
        :selected="currentApp === item"
      />
    </template>

    <template #before>
      <VueButton
        v-if="$shared.legacyApps"
        class="flat m-1"
        icon-left="cached"
        @click="scanLegacyApps()"
      >
        Scan apps
      </VueButton>
    </template>
  </AppHeaderSelect>
</template>

<style lang="postcss" scoped>
.app-button {
  width: 220px;
}
</style>
