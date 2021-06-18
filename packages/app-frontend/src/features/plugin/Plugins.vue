<script lang="ts">
import SplitPane from '@front/features/layout/SplitPane.vue'
import PluginListItem from './PluginListItem.vue'

import { defineComponent, ref, computed } from '@vue/composition-api'
import { usePlugins } from '.'
import EmptyPane from '../layout/EmptyPane.vue'

export default defineComponent({
  components: {
    SplitPane,
    PluginListItem,
    EmptyPane
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
      search
    }
  }
})
</script>

<template>
  <EmptyPane
    v-if="!plugins.length"
    icon="extension"
  >
    No devtools plugins found
  </EmptyPane>
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

      <portal to="header-end">
        <VueDropdown
          :offset="[0, 0]"
        >
          <template #trigger>
            <VueButton
              class="icon-button flat"
              icon-left="help"
            />
          </template>

          <div>
            <div class="px-10 py-8 flex items-center space-x-8 max-w-lg">
              <img
                src="~@front/assets/undraw_Gift_box.svg"
                class="max-h-32 flex-none"
              >

              <p class="flex-1">
                Devtools plugins are added by packages in your application. They can provide new features to the Vue devtools, such as custom inspectors, additional component data or timeline layers.
              </p>
            </div>
          </div>
        </VueDropdown>
      </portal>
    </template>

    <template #right>
      <router-view />
    </template>
  </SplitPane>
</template>

<style scoped>
.vue-ui-icon /deep/ svg {
  fill: currentColor;
}
</style>
