<script>
import { defineComponent, computed } from '@vue/composition-api'
import { useRoute } from '@front/util/router'

export default defineComponent({
  props: {
    lastInspectorRoute: {
      type: Object,
      default: null,
    },

    labelShown: {
      type: Boolean,
      default: false,
    },
  },

  setup (props) {
    const route = useRoute()
    const groupValue = computed(() => {
      if (route.value.matched.some(m => m.name === 'inspector')) {
        return 'inspector'
      } else if (route.value.matched.some(m => m.name === 'timeline')) {
        return 'timeline'
      }
      return null
    })

    const targetInspectorRoute = computed(() => props.lastInspectorRoute ? props.lastInspectorRoute.targetRoute : { name: 'inspector-components' })

    return {
      groupValue,
      targetInspectorRoute,
    }
  },
})
</script>

<template>
  <VueGroup
    :value="groupValue"
    indicator
    class="primary"
  >
    <VueGroupButton
      v-tooltip="'Inspector'"
      :to="targetInspectorRoute"
      value="inspector"
      class="flat"
      :class="{
        'icon-button': !labelShown,
      }"
      icon-left="explore"
    >
      <template v-if="labelShown">
        Inspector
      </template>
    </VueGroupButton>
    <VueGroupButton
      v-tooltip="'Timeline'"
      :to="{ name: 'timeline' }"
      value="timeline"
      class="flat"
      :class="{
        'icon-button': !labelShown,
      }"
      icon-left="line_style"
    >
      <template v-if="labelShown">
        Timeline
      </template>
    </VueGroupButton>
  </VueGroup>
</template>
