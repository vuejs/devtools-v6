<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { PluginSettingsItem } from '@vue/devtools-api'
import { Plugin } from '.'

export default defineComponent({
  props: {
    plugin: {
      type: Object as PropType<Plugin>,
      required: true
    },

    id: {
      type: String,
      required: true
    },

    schema: {
      type: Object as PropType<PluginSettingsItem>,
      required: true
    },

    value: {}
  },

  setup (props, { emit }) {
    const model = computed({
      get () {
        return props.value
      },
      set (value) {
        emit('update:value', value)
      }
    })

    function onLabelClick () {
      // @TODO
    }

    return {
      model,
      onLabelClick
    }
  }
})
</script>

<template>
  <div class="flex items-start px-6 py-2 hover:bg-green-50 dark:hover:bg-green-900">
    <div
      class="flex-1 select-none text-sm py-1.5"
      @click="onLabelClick()"
    >
      {{ schema.label }}
    </div>
    <div class="w-1/2">
      <VueSwitch
        v-if="schema.type === 'boolean'"
        v-model="model"
        class="my-2 w-full extend-left"
      />

      <template v-else-if="schema.type === 'choice'">
        <VueGroup
          v-if="schema.component === 'button-group'"
          v-model="model"
          class="extend w-full"
        >
          <VueGroupButton
            v-for="(option, index) of schema.options"
            :key="index"
            :value="option.value"
            :label="option.label"
          />
        </VueGroup>

        <VueSelect
          v-else
          v-model="model"
          class="w-full"
        >
          <VueSelectButton
            v-for="(option, index) of schema.options"
            :key="index"
            :value="option.value"
            :label="option.label"
          />
        </VueSelect>
      </template>

      <VueInput
        v-else-if="schema.type === 'text'"
        v-model="model"
        class="w-full"
      />
    </div>
  </div>
</template>
