<script lang="ts">
import AppHistoryNav from './AppHistoryNav.vue'
import AppSelect from '../apps/AppSelect.vue'
import AppHeaderSelect from './AppHeaderSelect.vue'
import PluginSourceIcon from '@front/features/plugin/PluginSourceIcon.vue'
import PluginSourceDescription from '../plugin/PluginSourceDescription.vue'

import { computed, ref, watch, defineComponent } from 'vue'
import type { RawLocation, Route } from 'vue-router'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useRoute } from '@front/util/router'
import { useBridge } from '@front/features/bridge'
import { useInspectors } from '@front/features/inspector/custom/composable'
import { useTabs } from './tabs'
import { showAppsSelector } from './header'
import { useOrientation } from '../layout/orientation'

interface HeaderRoute {
  icon: string
  label: string
  targetRoute: RawLocation
  matchRoute: (route: Route) => boolean
  pluginId?: string
}

export default defineComponent({
  components: {
    AppHistoryNav,
    AppSelect,
    AppHeaderSelect,
    PluginSourceIcon,
    PluginSourceDescription,
  },

  setup () {
    const route = useRoute()

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
      targetRoute: { name: 'custom-inspector', params: { inspectorId: i.id } },
      matchRoute: route => route.params.inspectorId === i.id,
    }))))

    const currentHeaderRoute = computed(() => headerRoutes.value.find(r => r.matchRoute(route.value)))

    const lastHeaderRoute = ref(null)
    watch(currentHeaderRoute, value => {
      if (value) {
        lastHeaderRoute.value = value
      }
    })

    // Current tab
    const { currentTab } = useTabs()
    const { bridge } = useBridge()

    watch(currentTab, value => {
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
    }
  },
})
</script>

<template>
  <div class="flex items-center space-x-2 px-2 h-8 box-content">
    <AppHistoryNav />

    <template v-if="showAppsSelector">
      <AppSelect />

      <img src="~@front/assets/breadcrumb-separator.svg">
    </template>

    <template v-if="orientation === 'portrait' || headerRoutes.length * 200 > $responsive.width - 250">
      <AppHeaderSelect
        :items="headerRoutes"
        :selected-item="currentHeaderRoute"
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

    <template v-else>
      <VueGroup
        :value="currentHeaderRoute"
        class="primary"
        indicator
        @update="route => $router.push(route.targetRoute)"
      >
        <VTooltip
          v-for="(item, index) of headerRoutes"
          :key="index"
          :disabled="!item.pluginId"
          class="leading-none"
        >
          <VueGroupButton
            :value="item"
            :icon-left="item.icon"
            class="flat"
          >
            {{ item.label }}
          </VueGroupButton>

          <template #popper>
            <PluginSourceDescription
              :plugin-id="item.pluginId"
            />
          </template>
        </VTooltip>
      </VueGroup>
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
            name: 'plugins'
          }"
          icon-left="extension"
        >
          Devtools plugins
        </VueDropdownButton>

        <VueDropdownButton
          :to="{
            name: 'global-settings'
          }"
          icon-left="settings"
        >
          Global settings
        </VueDropdownButton>

        <div class="border-t border-gray-200 dark:border-gray-800 my-1" />

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
  </div>
</template>
