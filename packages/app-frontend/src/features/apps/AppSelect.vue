<script lang="ts">
import { computed, defineComponent, watch } from 'vue'
import { BridgeEvents, SharedData } from '@vue-devtools/shared-utils'
import { pendingSelectAppId, scanLegacyApps, useApps } from '@front/features/apps'
import { useOrientation } from '@front/features/layout/orientation'
import { useRouter } from 'vue-router'
import AppHeaderSelect from '../header/AppHeaderSelect.vue'
import { useBridge } from '../bridge'
import AppSelectItem from './AppSelectItem.vue'
import { useVueVersionCheck } from './vue-version-check'

export default defineComponent({
  components: {
    AppHeaderSelect,
    AppSelectItem,
  },

  setup() {
    const router = useRouter()
    const { bridge } = useBridge()

    const {
      apps,
      currentAppId,
      currentApp,
      selectApp,
    } = useApps()

    watch(currentAppId, (value) => {
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
        }
        else if (currentAppId.value !== apps.value[0].id) {
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
        class="flat icon-button"
      >
        <div class="flex items-center space-x-2 relative">
          <img src="~@front/assets/vue-logo.svg" class="w-8 h-8">
          <VueIcon
            v-if="hasNewVueVersion"
            icon="new_releases"
            class="text-green-400 absolute right-0 bottom-0 w-4 h-4"
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
