<script>
import { usePlugins } from '.'
import SplitPane from '../layout/SplitPane.vue'

export default {
  components: { SplitPane },

  setup () {
    const { plugins } = usePlugins()

    return {
      plugins
    }
  }
}
</script>

<template>
  <SplitPane
    save-id="plugins"
    :default-split="30"
  >
    <template #left>
      <div class="overflow-y-auto h-full">
        <router-link
          v-for="plugin of plugins"
          :key="plugin.id"
          :to="{
            name: 'plugin-details',
            params: {
              pluginId: plugin.id
            }
          }"
          class="flex items-center space-x-2 px-3 py-1 hover:bg-green-100 dark-hover:bg-green-900"
          active-class="text-green-500"
        >
          <VueIcon
            icon="extension"
          />
          <span>{{ plugin.label }}</span>
        </router-link>
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

          <div class="px-4 py-2 max-w-lg">
            Devtools plugins are added by packages in your application. They can provide new features to the Vue devtools, such as custom inspectors, additional component data or timeline layers.
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
