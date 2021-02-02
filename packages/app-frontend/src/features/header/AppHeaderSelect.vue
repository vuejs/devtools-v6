<script>
import { ref, computed, watch } from '@vue/composition-api'
import { useOrientation } from '../layout/orientation'
import SharedData from '@utils/shared-data'

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

    const isShown = ref(false)
    const isShowApplied = ref(false)

    watch(isShown, value => {
      console.log('isShown', value)
    })

    /**
     * Delayed open should only happen on mouseover.
     * Will be overriden when clicking
     */
    const showDelayEnabled = ref(true)

    let disabled = false
    let toggleCloseEnabled = true
    let toggleCloseTimer = null

    let pendingOperation = null
    let operationTimer = null

    function queueOperation (type, delay) {
      if (disabled) return
      pendingOperation = type
      clearTimeout(operationTimer)
      operationTimer = setTimeout(() => applyOperation(), delay)
    }

    function applyOperation () {
      if (pendingOperation) {
        pendingOperation()
      }
      pendingOperation = null
      clearTimeout(operationTimer)
    }

    function queueOpen (delay = true) {
      queueOperation(() => {
        isShown.value = true

        toggleCloseEnabled = false
        clearTimeout(toggleCloseTimer)
        toggleCloseTimer = setTimeout(() => {
          toggleCloseEnabled = true
        }, 500)
      }, delay ? 250 : 1)
    }

    function queueClose (delay = true) {
      toggleCloseEnabled = false
      clearTimeout(toggleCloseTimer)
      queueOperation(() => {
        isShown.value = false
      }, delay ? 300 : 1)
    }

    function toggle () {
      if (isShown.value) {
        if (toggleCloseEnabled) {
          queueClose(false)
        }
      } else {
        // We open also when it's already open and
        // when the button close is disabled
        // so we cancel the popper autoclose
        // (the popper doesn't contain the trigger button)
        queueOpen(false)
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

    let wheelEnabled = true

    function onMouseWheel (e) {
      if (!wheelEnabled) return

      if (e.deltaY > 0) {
        selectNext()
      } else {
        selectPrevious()
      }

      if (SharedData.menuStepScrolling) {
        wheelEnabled = false
        setTimeout(() => {
          wheelEnabled = true
        }, 300)
      }
    }

    /* Layout */

    const { orientation } = useOrientation()

    return {
      isShown,
      isShowApplied,
      showDelayEnabled,
      queueOpen,
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
    :triggers="[]"
    :offset="[0, 0]"
    :shown.sync="isShown"
    :show-group="`header-select-${_uid}`"
    :delay="0"
    :auto-hide="false"
    @apply-show="isShowApplied = true"
    @apply-hide="isShowApplied = false"
  >
    <template #trigger>
      <div
        @mouseenter="queueOpen()"
        @mouseleave="queueClose()"
        @wheel="onMouseWheel"
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
        @mouseenter="queueOpen()"
        @mouseleave="queueClose()"
        @wheel="onMouseWheel"
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

.vue-ui-dropdown-button /deep/ {
  .default-slot {
    flex: 1;
  }
}
</style>
