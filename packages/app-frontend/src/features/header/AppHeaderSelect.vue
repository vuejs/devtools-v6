<script>
import { ref, computed } from '@vue/composition-api'
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
    const isShown = ref(false)
    let disabled = false

    let timer = null

    function open () {
      clearTimeout(timer)
      if (disabled) return
      isOpen.value = true
    }

    function queueClose () {
      clearTimeout(timer)
      if (!isShown.value) {
        isOpen.value = false
      } else {
        timer = setTimeout(() => {
          isOpen.value = false
        }, 500)
      }
    }

    function select (item) {
      disabled = true
      emit('select', item)
      // Disable menu for a short time after selecting an item
      setTimeout(() => {
        disabled = false
      }, 500)
    }

    const selectedIndex = computed(() => props.items.indexOf(props.selectedItem))

    function selectNext () {
      let index = selectedIndex.value + 1
      if (index >= props.items.length) {
        index = 0
      }
      select(props.items[index])
    }

    function selectPrevious () {
      let index = selectedIndex.value - 1
      if (index < 0) {
        index = props.items.length - 1
      }
      select(props.items[index])
    }

    function onMouseWheel (e) {
      if (e.deltaY > 0) {
        selectNext()
      } else {
        selectPrevious()
      }
    }

    const { orientation } = useOrientation()

    return {
      isOpen,
      isShown,
      open,
      queueClose,
      select,
      orientation,
      onMouseWheel
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
    :delay="{ show: 250, hide: 0 }"
    @apply-show="isShown = true"
    @apply-hide="isShown = false"
  >
    <template #trigger>
      <div
        @mouseover="open()"
        @mouseout="queueClose()"
        @mousewheel="onMouseWheel"
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

        <div
          v-if="$shared.showMenuScrollTip"
          class="text-xs flex items-center space-x-2 text-gray-500 pl-4 pr-1 py-1 border-t border-gray-200 dark:border-gray-800 group"
        >
          <span>Scroll to switch</span>
          <VueIcon icon="mouse" />

          <span class="flex-1" />

          <VueButton
            class="flex-none icon-button flat invisible group-hover:visible"
            icon-left="close"
            @click="$shared.showMenuScrollTip = false"
          />
        </div>
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
