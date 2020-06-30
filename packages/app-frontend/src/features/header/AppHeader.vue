<script>
import { useRoute } from '@front/util/router'
import { computed, ref } from '@vue/composition-api'
import AppHistoryNav from './AppHistoryNav.vue'
import AppSelect from './AppSelect.vue'

export default {
  components: {
    AppHistoryNav,
    AppSelect
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
  <div class="border-b border-gray-200 flex items-center space-x-2 px-2 h-10">
    <img
      src="~@front/assets/logo.png"
      alt="Vue logo"
      class="w-8 h-8"
    >

    <AppHistoryNav />

    <AppSelect />

    <img src="~@front/assets/breadcrumb-separator.svg">

    <VueDropdown
      placement="bottom-start"
    >
      <template #trigger>
        <VueButton
          class="flat"
          :icon-left="currentMainRoute.icon"
          icon-right="arrow_drop_down"
        >
          {{ currentMainRoute.label }}
        </VueButton>
      </template>

      <VueDropdownButton
        v-for="(route, index) of allMainRoutes"
        :key="index"
        :to="{
          name: route.targetRoute
        }"
        :icon-left="route.icon"
      >
        {{ route.label }}
      </VueDropdownButton>
    </VueDropdown>

    <template v-if="currentInspectorRoute">
      <img src="~@front/assets/breadcrumb-separator.svg">

      <VueDropdown
        placement="bottom-start"
      >
        <template #trigger>
          <VueButton
            class="flat"
            :icon-left="currentInspectorRoute.icon"
            icon-right="arrow_drop_down"
          >
            {{ currentInspectorRoute.label }}
          </VueButton>
        </template>

        <VueDropdownButton
          v-for="(route, index) of inspectorRoutes"
          :key="index"
          :to="{
            name: route.targetRoute
          }"
          :icon-left="route.icon"
        >
          {{ route.label }}
        </VueDropdownButton>
      </VueDropdown>
    </template>

    <div class="flex-1" />

    <VueDropdown>
      <template #trigger>
        <VueButton
          icon-left="more_vert"
          class="icon-button flat"
        />
      </template>

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
