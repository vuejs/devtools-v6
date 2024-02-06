<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import type { RouteLocation, RouteLocationRaw } from 'vue-router'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useRoute } from 'vue-router'
import { useBridge } from '@front/features/bridge'
import { useInspectors } from '@front/features/inspector/custom/composable'
import PluginSourceDescription from '../plugin/PluginSourceDescription.vue'
import AppSelect from '../apps/AppSelect.vue'
import { useOrientation } from '../layout/orientation'
import { type Plugin, usePlugins } from '../plugin/index'
import { useTabs } from './tabs'
import { showAppsSelector } from './header'
import AppHistoryNav from './AppHistoryNav.vue'

interface HeaderRoute {
  icon: string
  label: string
  targetRoute: RouteLocationRaw
  matchRoute: (route: RouteLocation) => boolean
  pluginId?: string
  plugin?: Plugin
}

export default defineComponent({
  components: {
    AppHistoryNav,
    AppSelect,
    PluginSourceDescription,
  },

  setup() {
    const route = useRoute()

    // Plugins

    const {
      plugins,
    } = usePlugins()

    function getPlugin(pluginId: string) {
      return plugins.value.find(p => p.id === pluginId)
    }

    // Inspector routes

    const { inspectors: customInspectors } = useInspectors()

    const headerRoutes = computed(() => ([
      {
        icon: 'device_hub',
        label: 'Components',
        targetRoute: { name: 'inspector-components' },
        matchRoute: route => route.matched.some(m => m.name === 'inspector-components'),
      },
      {
        icon: 'line_style',
        label: 'Timeline',
        targetRoute: { name: 'timeline' },
        matchRoute: route => route.matched.some(m => m.name === 'timeline'),
      },
    ] as HeaderRoute[]).concat(customInspectors.value.map(i => ({
      icon: i.icon || 'tab',
      label: i.label,
      pluginId: i.pluginId,
      plugin: getPlugin(i.pluginId),
      targetRoute: { name: 'custom-inspector', params: { inspectorId: i.id } },
      matchRoute: route => route.params.inspectorId === i.id,
    }))))

    const routesPerPlugin = computed(() => {
      const routes: Record<string, HeaderRoute[]> = {}
      for (const route of headerRoutes.value) {
        if (route.pluginId) {
          if (!routes[route.pluginId]) {
            routes[route.pluginId] = []
          }
          routes[route.pluginId].push(route)
        }
      }
      return routes
    })

    const logoErrors = ref(new Set<string>())

    const currentHeaderRoute = computed(() => headerRoutes.value.find(r => r.matchRoute(route)))

    const lastHeaderRoute = ref(null)
    watch(currentHeaderRoute, (value) => {
      if (value) {
        lastHeaderRoute.value = value
      }
    })

    function shouldDisplayLogo(item: HeaderRoute) {
      if (item.pluginId?.startsWith('org.vuejs')) {
        return false
      }
      return item.plugin?.logo && routesPerPlugin.value[item.pluginId]?.length < 2 && !logoErrors.value.has(item.pluginId)
    }

    // Current tab
    const { currentTab } = useTabs()
    const { bridge } = useBridge()

    watch(currentTab, (value) => {
      bridge.send(BridgeEvents.TO_BACK_TAB_SWITCH, value)
    }, {
      immediate: true,
    })

    // Orientation

    const { orientation } = useOrientation()

    return {
      headerRoutes,
      currentHeaderRoute,
      lastHeaderRoute,
      showAppsSelector,
      orientation,
      routesPerPlugin,
      logoErrors,
      shouldDisplayLogo,
    }
  },
})
</script>

<template>
  <div
    class="flex items-center border-r border-gray-200 dark:border-gray-700 p-0.5 overflow-y-auto"
    :class="{
      'flex-col': orientation === 'landscape',
    }"
  >
    <AppSelect v-if="showAppsSelector" />
    <img
      v-else
      src="~@front/assets/vue-logo.svg"
      class="w-8 h-8"
    >

    <VueGroup
      :model-value="currentHeaderRoute"
      class="primary"
      :class="{
        vertical: orientation === 'landscape',
      }"
      indicator
      @update:model-value="(route: HeaderRoute) => route && $router.push(route.targetRoute)"
    >
      <VTooltip
        v-for="(item, index) of headerRoutes"
        :key="index"
        placement="right"
        class="leading-none"
      >
        <VueGroupButton
          :value="item"
          :icon-left="shouldDisplayLogo(item) ? null : item.icon"
          class="flat icon-button"
        >
          <img
            v-if="shouldDisplayLogo(item)"
            :src="item.plugin.logo"
            class="w-4 h-4"
            @error="logoErrors.add(item.pluginId)"
          >
        </VueGroupButton>

        <template #popper>
          <div class="font-bold">
            {{ item.label }}
          </div>
          <PluginSourceDescription
            v-if="item.pluginId"
            :plugin-id="item.pluginId"
            class="mt-2"
          />
        </template>
      </VTooltip>
    </VueGroup>

    <div class="flex-1" />

    <VueDropdown
      :placement="orientation === 'landscape' ? 'right' : 'bottom-end'"
    >
      <template #trigger>
        <VueButton
          icon-left="settings"
          class="icon-button flat"
        />
      </template>

      <AppHistoryNav
        class="px-2 py-1"
      />

      <VueDropdownButton
        :to="{
          name: 'global-settings',
        }"
        icon-left="settings"
      >
        More settings
      </VueDropdownButton>

      <VueDropdownButton
        :to="{
          name: 'plugins',
        }"
        icon-left="extension"
      >
        Devtools plugins
      </VueDropdownButton>

      <div class="border-t border-gray-200 dark:border-gray-700 my-1" />

      <VueDropdownButton
        href="https://devtools.vuejs.org"
        target="_blank"
        icon-left="description"
        icon-right="open_in_new"
        class="right-icon-reveal"
      >
        Documentation
      </VueDropdownButton>

      <VueDropdownButton
        href="https://github.com/vuejs/devtools/issues/new/choose"
        target="_blank"
        icon-left="bug_report"
        icon-right="open_in_new"
        class="right-icon-reveal"
      >
        Report a bug
      </VueDropdownButton>

      <VueDropdownButton
        href="https://github.com/vuejs/vue-devtools/releases"
        target="_blank"
        icon-left="campaign"
        icon-right="open_in_new"
        class="right-icon-reveal"
      >
        What's new
      </VueDropdownButton>
    </VueDropdown>
  </div>
</template>

<style lang="postcss" scoped>
.vue-ui-group :deep(.indicator) {
  @apply !p-px;
  .content {
    @apply !border !border-green-500/30 rounded-md bg-green-500/10;
  }
}
</style>
