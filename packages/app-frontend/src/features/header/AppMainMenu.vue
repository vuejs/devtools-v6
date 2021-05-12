<script>
import { defineComponent, computed } from '@vue/composition-api'
import { useRoute } from '@front/util/router'

export default defineComponent({
  props: {
    lastInspectorRoute: {
      type: Object,
      default: null
    }
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
      targetInspectorRoute
    }
  }
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
      class="icon-button flat"
      icon-left="explore"
    />
    <VueGroupButton
      v-tooltip="'Timeline'"
      :to="{ name: 'timeline' }"
      value="timeline"
      class="icon-button flat"
      icon-left="line_style"
    />
  </VueGroup>
</template>
