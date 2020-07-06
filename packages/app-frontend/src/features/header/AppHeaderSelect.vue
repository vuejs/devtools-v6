<script>
import { ref } from '@vue/composition-api'
import { useOrientation } from '../layout/orientation'

export default {
  props: {
    items: {
      type: Array,
      required: true
    },

    selectedItem: {
      type: Object,
      default: () => ({})
    },

    optionIcon: {
      type: String,
      default: null
    }
  },

  setup (props, { emit }) {
    const isOpen = ref(false)
    let disabled = false

    let timer = null

    function open () {
      clearTimeout(timer)
      if (disabled) return
      isOpen.value = true
    }

    function queueClose () {
      clearTimeout(timer)
      timer = setTimeout(() => {
        isOpen.value = false
      }, 500)
    }

    function select (item) {
      disabled = true
      emit('select', item)
      // Disable menu for a short time after selecting an item
      setTimeout(() => {
        disabled = false
      }, 500)
    }

    const { orientation } = useOrientation()

    return {
      isOpen,
      open,
      queueClose,
      select,
      orientation
    }
  }
}
</script>

<template>
  <VueDropdown
    placement="bottom-start"
    trigger="manual"
    offset="0"
    :open.sync="isOpen"
    :open-group="`header-select-${_uid}`"
  >
    <template #trigger>
      <div
        @mouseover="open()"
        @mouseout="queueClose()"
      >
        <slot name="trigger">
          <VueButton
            class="flat"
            :icon-left="selectedItem.icon"
            :icon-right="orientation === 'landscape' ? 'arrow_drop_down' : null"
            :class="{
              'icon-button': orientation === 'portrait'
            }"
          >
            <template v-if="orientation === 'landscape'">
              {{ selectedItem.label }}
            </template>
          </VueButton>
        </slot>
      </div>
    </template>

    <div>
      <div
        class="flex flex-col"
        @mouseover="open()"
        @mouseout="queueClose()"
      >
        <VueDropdownButton
          v-for="(item, index) of items"
          :key="index"
          :icon-left="item.icon || optionIcon"
          :class="{
            selected: selectedItem === item
          }"
          @click="select(item)"
        >
          <slot :item="item">
            {{ item.label }}
          </slot>
        </VueDropdownButton>
      </div>
    </div>
  </VueDropdown>
</template>

<style lang="postcss" scoped>
.selected {
  @apply bg-green-100 text-green-700 !important;

  >>> svg {
    fill: currentColor !important;
  }
}
</style>
