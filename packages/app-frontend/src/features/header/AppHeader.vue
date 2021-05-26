<script lang="ts">
import PluginSourceIcon from '@front/features/plugin/PluginSourceIcon.vue'
import AppHeaderLogo from './AppHeaderLogo.vue'
import AppHistoryNav from './AppHistoryNav.vue'
import AppSelect from './AppSelect.vue'
import AppHeaderSelect from './AppHeaderSelect.vue'
import AppMainMenu from './AppMainMenu.vue'

import { computed, ref, watch, defineComponent } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useRoute } from '@front/util/router'
import { useBridge } from '@front/features/bridge'
import { useInspectors } from '@front/features/inspector/custom/composable'
import { useTabs } from './tabs'

export default defineComponent({
  components: {
    AppHeaderLogo,
    AppHistoryNav,
    AppSelect,
    AppHeaderSelect,
    AppMainMenu,
    PluginSourceIcon
  },

  setup () {
    const route = useRoute()

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
      inspectorRoutes,
      currentInspectorRoute,
      lastInspectorRoute
    }
  }
})
</script>

<template>
  <div class="flex items-center space-x-2 px-2 h-8">
    <AppHeaderLogo />

    <AppHistoryNav />

    <AppSelect />

    <img src="~@front/assets/breadcrumb-separator.svg">

    <AppMainMenu
      :last-inspector-route="lastInspectorRoute"
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
          href="https://new-issue.vuejs.org/?repo=vuejs/vue-devtools"
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
