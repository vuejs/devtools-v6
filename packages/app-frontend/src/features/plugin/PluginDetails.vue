<script lang="ts">
import EmptyPane from '@front/features/layout/EmptyPane.vue'
import SplitPane from '@front/features/layout/SplitPane.vue'
import PluginPermission from './PluginPermission.vue'
import PluginSettings from './PluginSettings.vue'

import { computed, defineComponent } from 'vue'
import { usePlugins } from '.'

export default defineComponent({
  components: {
    EmptyPane,
    SplitPane,
    PluginPermission,
    PluginSettings,
  },

  props: {
    pluginId: {
      type: [String, Number],
      required: true,
    },
  },

  setup (props) {
    const { plugins } = usePlugins()
    const plugin = computed(() => plugins.value.find(p => p.id === props.pluginId))

    return {
      plugin,
    }
  },
})
</script>

<template>
  <SplitPane
    v-if="plugin"
    :key="plugin.id"
    save-id="plugin-details"
    class="h-full"
  >
    <template #left>
      <div class="h-full overflow-y-auto">
        <div class="px-6 py-4 flex space-x-6">
          <div class="flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-900 rounded">
            <img
              v-if="plugin.logo"
              :src="plugin.logo"
              alt="Plugin logo"
              class="logo"
            >
            <VueIcon
              v-else
              icon="extension"
              class="big text-gray-500"
            />
          </div>
          <div>
            <div class="font-bold">
              {{ plugin.label }}
            </div>
            <div v-if="plugin.homepage">
              <a
                :href="plugin.homepage"
                target="_blank"
                class="flex items-center text-green-600 dark:text-green-400 space-x-1"
              >
                <span>Homepage</span>
                <VueIcon
                  icon="launch"
                />
              </a>
            </div>
            <div>
              ID: <span class="font-mono text-sm px-1 bg-gray-200 dark:bg-gray-900 rounded">{{ plugin.id }}</span>
            </div>
            <div v-if="plugin.packageName">
              Package: <span class="font-mono text-sm px-1 bg-gray-200 dark:bg-gray-900 rounded">{{ plugin.packageName }}</span>
            </div>
          </div>
        </div>

        <div>
          <PluginPermission
            :plugin-id="plugin.id"
            permission="enabled"
            label="Enabled"
            class="px-6 py-4"
          />
        </div>

        <div>
          <h2 class="px-6 py-2 text-gray-500">
            Permissions
          </h2>

          <PluginPermission
            :plugin-id="plugin.id"
            permission="components"
            label="Components"
            class="px-6 py-2"
          />
          <PluginPermission
            :plugin-id="plugin.id"
            permission="custom-inspector"
            label="Custom inspectors"
            class="px-6 py-2"
          />
          <PluginPermission
            :plugin-id="plugin.id"
            permission="timeline"
            label="Timeline"
            class="px-6 py-2"
          />
        </div>
      </div>
    </template>

    <template #right>
      <PluginSettings
        :plugin="plugin"
        class="h-full overflow-y-auto"
      />
    </template>
  </SplitPane>

  <EmptyPane
    v-else
    icon="error"
  >
    Plugin not found
  </EmptyPane>
</template>

<style lang="postcss" scoped>
.logo {
  max-width: 48px;
  max-height: 48px;
}
</style>
