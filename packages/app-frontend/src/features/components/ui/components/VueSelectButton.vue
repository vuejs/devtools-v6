<template>
  <VueGroupButton
    ref="groupButton"
    class="vue-ui-select-button"
    v-close-popper="true"
    :label="label"
    flat
    @selected="onSelect"
  >
    <slot/>
  </VueGroupButton>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, getCurrentInstance, ComponentInternalInstance, Ref, ref } from 'vue'

export default defineComponent({
  name: 'VueSelectButton',

  props: {
    label: {
      type: String,
      default: null,
    },
  },

  setup () {
    const currentInstance = getCurrentInstance()
    const groupButton = ref(null)
    const { setCurrentChild, getCurrentChild } = inject<{
      setCurrentChild: (child: ComponentInternalInstance) => void
      getCurrentChild: () => Ref<ComponentInternalInstance | null>}>('VueSelect')

    onMounted(() => {
      onSelect(groupButton.value.selected)
    })

    function onSelect (selected: boolean) {
      if (selected) {
        setCurrentChild(currentInstance)
      } else if (getCurrentChild()?.value === currentInstance) {
        setCurrentChild(null)
      }
    }

    return {
      groupButton,
      onSelect,
    }
  },
})
</script>
