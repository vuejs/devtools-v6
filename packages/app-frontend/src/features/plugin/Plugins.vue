<script lang="ts">
import SplitPane from '@front/features/layout/SplitPane.vue'
import PluginListItem from './PluginListItem.vue'
import PluginHome from './PluginHome.vue'

import { defineComponent, ref, computed } from 'vue'
import { usePlugins } from '.'

export default defineComponent({
  components: {
    SplitPane,
    PluginListItem,
    PluginHome,
  },

  setup () {
    const { plugins } = usePlugins()

    const search = ref('')

    const filteredPlugins = computed(() => {
      if (search.value) {
        const reg = new RegExp(search.value, 'i')
        return plugins.value.filter(p => p.label.match(reg) != null)
      }
      return plugins.value
    })

    return {
      plugins: filteredPlugins,
      search,
    }
  },
})
</script>

<template>
  <div class="h-full">
    <PluginHome
      v-if="!plugins.length"
      no-plugins
    />
    <SplitPane
      v-else
      save-id="plugins"
      :default-split="30"
    >
      <template #left>
        <div class="h-full flex flex-col">
          <div class="flex-none">
            <VueInput
              v-model="search"
              icon-left="search"
              placeholder="Filter devtools plugins..."
              select-all
              class="w-full flat border-b border-gray-200 dark:border-gray-800"
            />
          </div>
          <div class="overflow-y-auto">
            <PluginListItem
              v-for="plugin of plugins"
              :key="plugin.id"
              :plugin="plugin"
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="h-full overflow-y-auto">
          <router-view />
        </div>
      </template>
    </SplitPane>

    <portal to="header-end">
      <VueButton
        :to="{
          name: 'global-settings'
        }"
        icon-left="settings"
        class="flat"
      >
        Global settings
      </VueButton>
    </portal>
  </div>
</template>

<style scoped>
.vue-ui-icon /deep/ svg {
  fill: currentColor;
}
</style>
