<script lang="ts">
import AppSelectPaneItem from './AppSelectPaneItem.vue'

import { watch, defineComponent, ref, computed } from 'vue'
import { BridgeEvents, SharedData } from '@vue-devtools/shared-utils'
import { useApps, pendingSelectAppId, scanLegacyApps } from '@front/features/apps'
import { useRouter } from '@front/util/router'
import { useBridge } from '../bridge'

export default defineComponent({
  components: {
    AppSelectPaneItem,
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

    // Search
    const search = ref('')
    const filteredApps = computed(() => {
      if (!search.value) return apps.value
      const searchValue = search.value.toLowerCase()
      return apps.value.filter(app => {
        return app.name.toLowerCase().includes(searchValue)
      })
    })

    return {
      currentApp,
      filteredApps,
      selectApp,
      search,
      scanLegacyApps,
    }
  },
})
</script>

<template>
  <div class="flex flex-col">
    <div class="flex-none border-b border-gray-200 dark:border-gray-800 flex items-center space-x-1 h-8 pr-1 box-content">
      <VueInput
        v-model="search"
        icon-left="search"
        placeholder="Find apps..."
        select-all
        class="search flat flex-1 min-w-0"
      />

      <VueButton
        v-if="$shared.legacyApps"
        v-tooltip="'Scan apps'"
        class="flat icon-button"
        icon-left="cached"
        @click="scanLegacyApps()"
      />
    </div>

    <div class="overflow-y-auto flex-1">
      <AppSelectPaneItem
        v-for="item of filteredApps"
        :key="item.id"
        :app="item"
        :selected="item === currentApp"
        @select="selectApp(item.id)"
      />
    </div>
  </div>
</template>
