<script>
import { computed, ref, watch } from '@vue/composition-api'
import { useRoute } from '@front/util/router'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import AppMainMenu from './AppMainMenu.vue'
import AppHistoryNav from './AppHistoryNav.vue'
import AppSelect from './AppSelect.vue'
import AppHeaderSelect from './AppHeaderSelect.vue'
import { useBridge } from '../bridge'
import { useTabs } from './tabs'

export default {
  components: {
    AppMainMenu,
    AppHistoryNav,
    AppSelect,
    AppHeaderSelect
  },

  setup () {
    const route = useRoute()

    // Main routes

    const defaultMainRoutes = [
      {
        icon: 'explore',
        label: 'Inspector',
        matchRoute: 'inspector',
        // @TODO remember last inspector route
        targetRoute: 'inspector-components'
      },
      {
        icon: 'history',
        label: 'Timeline',
        matchRoute: 'timeline',
        targetRoute: 'timeline'
      },
      {
        icon: 'settings',
        label: 'Settings',
        matchRoute: 'global-settings',
        targetRoute: 'global-settings'
      }
    ]

    // @TODO support custom routes
    const allMainRoutes = computed(() => defaultMainRoutes)

    const currentMainRoute = computed(() => allMainRoutes.value.find(r => route.value.matched.some(m => m.name === r.matchRoute)))

    // Inspector routes

    const inspectorRoutes = ref([
      {
        icon: 'device_hub',
        label: 'Components',
        matchRoute: 'inspector',
        targetRoute: 'inspector-components'
      }
    ])

    // @TODO custom inspector routes

    const currentInspectorRoute = computed(() => inspectorRoutes.value.find(r => route.value.matched.some(m => m.name === r.matchRoute)))

    // Current tab
    const { currentTab } = useTabs()
    const { bridge } = useBridge()

    watch(currentTab, value => {
      bridge.send(BridgeEvents.TO_BACK_TAB_SWITCH, value)
    }, {
      immediate: true
    })

    return {
      allMainRoutes,
      currentMainRoute,
      inspectorRoutes,
      currentInspectorRoute
    }
  }
}
</script>

<template>
  <div class="border-b border-gray-200 dark:border-gray-900 flex items-center space-x-2 px-2 h-10">
    <AppMainMenu />

    <AppHistoryNav />

    <AppSelect />

    <img src="~@front/assets/breadcrumb-separator.svg">

    <AppHeaderSelect
      :items="allMainRoutes"
      :selected-item="currentMainRoute"
      @select="route => $router.push({ name: route.targetRoute })"
    />

    <template v-if="currentInspectorRoute">
      <img src="~@front/assets/breadcrumb-separator.svg">

      <AppHeaderSelect
        :items="inspectorRoutes"
        :selected-item="currentInspectorRoute"
        @select="route => $router.push({ name: route.targetRoute })"
      />
    </template>

    <div class="flex-1" />

    <portal-target name="header-end" />

    <VueDropdown
      offset="0"
    >
      <template #trigger>
        <VueButton
          icon-left="more_vert"
          class="icon-button flat"
        />
      </template>

      <portal-target name="more-menu" />

      <VueDropdownButton
        :to="{
          name: 'global-settings'
        }"
      >
        Global settings...
      </VueDropdownButton>
    </VueDropdown>
  </div>
</template>
