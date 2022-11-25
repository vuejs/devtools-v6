<script lang="ts">
import EmptyPane from '@front/features/layout/EmptyPane.vue'
import PluginSettingsItem from './PluginSettingsItem.vue'

import { defineComponent, computed, PropType } from 'vue'
import { getPluginSettings, setPluginSettings, getPluginDefaultSettings } from '@vue-devtools/shared-utils'
import cloneDeep from 'lodash/cloneDeep'
import { Plugin } from '.'
import { getBridge } from '../bridge'
import { BridgeEvents } from '@vue-devtools/shared-utils/src'

export default defineComponent({
  components: {
    EmptyPane,
    PluginSettingsItem,
  },

  props: {
    plugin: {
      type: Object as PropType<Plugin>,
      required: true,
    },
  },

  setup (props) {
    const defaultValues = computed(() => getPluginDefaultSettings(props.plugin.settingsSchema))

    const currentValues = computed(() => getPluginSettings(props.plugin.id, defaultValues.value))

    function updateValue (id: string, value: any) {
      const oldValue = cloneDeep(currentValues.value[id])
      setPluginSettings(props.plugin.id, {
        ...currentValues.value,
        [id]: value,
      })
      getBridge().send(BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_SETTING_UPDATED, { pluginId: props.plugin.id, key: id, newValue: value, oldValue })
    }

    return {
      currentValues,
      updateValue,
    }
  },
})
</script>

<template>
  <EmptyPane
    v-if="!plugin.settingsSchema || !Object.keys(plugin.settingsSchema).length"
    icon="settings_applications"
  >
    No settings found for this plugin
  </EmptyPane>

  <div v-else>
    <h2 class="px-6 pt-4 pb-2 text-gray-500">
      Plugin settings
    </h2>

    <PluginSettingsItem
      v-for="(schema, id) in plugin.settingsSchema"
      :id="id"
      :key="id"
      :schema="schema"
      :plugin="plugin"
      :value="currentValues[id]"
      @update:value="value => updateValue(id, value)"
    />
  </div>
</template>
