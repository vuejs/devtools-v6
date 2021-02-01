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
import { useInspectors } from '../inspector/custom'
import PluginSourceIcon from '../plugin/PluginSourceIcon.vue'

export default {
  components: {
    AppMainMenu,
    AppHistoryNav,
    AppSelect,
    AppHeaderSelect,
    PluginSourceIcon
  },

  setup () {
    const route = useRoute()

    // Main routes

    const defaultMainRoutes = computed(() => [
      {
        icon: 'explore',
        label: 'Inspector',
        matchRoute: 'inspector',
        targetRoute: lastInspectorRoute.value ? lastInspectorRoute.value.targetRoute : { name: 'inspector-components' }
      },
      {
        icon: 'line_style',
        label: 'Timeline',
        matchRoute: 'timeline',
        targetRoute: { name: 'timeline' }
      },
      {
        icon: 'extension',
        label: 'Plugins',
        matchRoute: 'plugins',
        targetRoute: { name: 'plugins' }
      },
      {
        icon: 'settings',
        label: 'Settings',
        matchRoute: 'global-settings',
        targetRoute: { name: 'global-settings' }
      }
    ])

    // @TODO support custom routes
    const allMainRoutes = computed(() => defaultMainRoutes.value)

    const currentMainRoute = computed(() => allMainRoutes.value.find(r => route.value.matched.some(m => m.name === r.matchRoute)))

    // Inspector routes

    const { inspectors: customInspectors } = useInspectors()

    const inspectorRoutes = computed(() => [
      {
        icon: 'device_hub',
        label: 'Components',
        targetRoute: { name: 'inspector-components' },
        matchRoute: route => route.matched.some(m => m.name === 'inspector-components')
      }
    ].concat(customInspectors.value.map(i => ({
      icon: i.icon || 'tab',
      label: i.label,
      pluginId: i.pluginId,
      targetRoute: { name: 'custom-inspector', params: { inspectorId: i.id } },
      matchRoute: route => route.params.inspectorId === i.id
    }))))

    const currentInspectorRoute = computed(() => inspectorRoutes.value.find(r => r.matchRoute(route.value)))

    const lastInspectorRoute = ref(null)
    watch(currentInspectorRoute, value => {
      if (value) {
        lastInspectorRoute.value = value
      }
    })

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
      @select="route => $router.push(route.targetRoute)"
    />

    <template v-if="currentInspectorRoute">
      <img src="~@front/assets/breadcrumb-separator.svg">

      <AppHeaderSelect
        :items="inspectorRoutes"
        :selected-item="currentInspectorRoute"
        @select="route => $router.push(route.targetRoute)"
      >
        <template #default="{ item }">
          <div class="flex items-center space-x-2">
            <span class="flex-1">{{ item.label }}</span>
            <PluginSourceIcon
              v-if="item.pluginId"
              :plugin-id="item.pluginId"
              class="flex-none"
            />
          </div>
        </template>
      </AppHeaderSelect>
    </template>

    <div class="flex-1" />

    <div class="flex items-center">
      <portal-target
        name="header-end"
        class="flex items-center"
      />

      <VueDropdown
        :offset="[0, 0]"
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

        <div class="border-t border-gray-200 dark:border-gray-900 my-1" />

        <VueDropdownButton
          href="https://new-issue.vuejs.org/?repo=vuejs/vue-devtools"
          target="_blank"
        >
          Report a bug
        </VueDropdownButton>

        <VueDropdownButton
          href="https://github.com/vuejs/vue-devtools/releases"
          target="_blank"
        >
          Full changelog
        </VueDropdownButton>
      </VueDropdown>
    </div>
  </div>
</template>
