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
    /* Open/Close */

    const isOpen = ref(false)
    const isShown = ref(false)

    /**
     * Delayed open should only happen on mouseover.
     * Will be overriden when clicking
     */
    const showDelayEnabled = ref(true)

    let disabled = false
    let buttonCloseEnabled = false

    // Timers

    let closeTimer = null
    let buttonCloseTimer = null

    function open (delay = true) {
      if (disabled) return
      clearTimeout(closeTimer)
      buttonCloseEnabled = false

      // Delay popper opening depending on wether
      // we mouseover (delay) or we click (no delay)
      showDelayEnabled.value = delay

      // Delay so we can override popper autoclose
      // which is itself delayed (to handle v-close-popper)
      requestAnimationFrame(() => {
        isOpen.value = true

        // Allow closing with button after a delay
        // so people don't mistakenly close the menu
        // after it auto-opens on mouse over
        if (!delay) {
          buttonCloseEnabled = true
        } else if (!buttonCloseTimer) {
          buttonCloseTimer = setTimeout(() => {
            buttonCloseEnabled = true
          }, 500)
        }
      })
    }

    function queueClose (delay = true) {
      clearTimeout(closeTimer)
      clearTimeout(buttonCloseTimer)
      buttonCloseTimer = null
      buttonCloseEnabled = false

      if (!isShown.value && delay) {
        isOpen.value = false
      } else {
        // Close after a delay
        closeTimer = setTimeout(() => {
          isOpen.value = false
        }, 300)
      }
    }

    function toggle () {
      if (isOpen.value && buttonCloseEnabled) {
        queueClose(false)
      } else {
        // We open also when it's already open and
        // when the button close is disabled
        // so we cancel the popper autoclose
        // (the popper doesn't contain the trigger button)
        open(false)
      }
    }

    /* Select */

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
      const index = selectedIndex.value + 1
      if (index < props.items.length) {
        select(props.items[index])
      }
    }

    function selectPrevious () {
      const index = selectedIndex.value - 1
      if (index >= 0) {
        select(props.items[index])
      }
    }

    function onMouseWheel (e) {
      if (e.deltaY > 0) {
        selectNext()
      } else {
        selectPrevious()
      }
    }

    /* Layout */

    const { orientation } = useOrientation()

    return {
      isOpen,
      isShown,
      showDelayEnabled,
      open,
      queueClose,
      toggle,
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
    :delay="showDelayEnabled ? { show: 250, hide: 0 } : 0"
    @apply-show="isShown = true"
    @apply-hide="isShown = false"
  >
    <template #trigger>
      <div
        @mouseover="open()"
        @mouseout="queueClose()"
        @mousewheel="onMouseWheel"
        @click.capture="toggle()"
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
        @mousewheel="onMouseWheel"
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

  .vue-ui-dark-mode & {
    @apply bg-gray-700 text-gray-100 !important;
  }

  >>> svg {
    fill: currentColor !important;
  }
}
</style>
