<script>
import { computed } from '@vue/composition-api'
import { useComponentStateTypePlugin } from '../plugin'
import { useOrientation } from '../layout/orientation'
import StateFields from './StateFields.vue'
import PluginSourceIcon from '../plugin/PluginSourceIcon.vue'

export default {
  components: {
    StateFields,
    PluginSourceIcon
  },

  props: {
    dataType: {
      type: String,
      required: true
    },

    index: {
      type: Number,
      required: true
    },

    state: {
      type: Object,
      required: true
    },

    expandedState: {
      type: Object,
      required: true
    },

    forceCollapse: {
      type: String,
      default: null
    },

    highDensity: {
      type: Boolean,
      default: false
    },

    dimAfter: {
      type: Number,
      default: -1
    }
  },

  setup (props) {
    const { getStateTypePlugin } = useComponentStateTypePlugin()
    const plugin = computed(() => getStateTypePlugin(props.dataType))

    const { orientation } = useOrientation()

    function toDisplayType (dataType, asClass) {
      return dataType === 'undefined'
        ? 'data'
        : asClass
          ? dataType.replace(/\s/g, '-')
          : dataType
    }

    const isExpanded = computed(() => {
      const value = props.expandedState[props.dataType]
      return typeof value === 'undefined' || value
    })

    return {
      plugin,
      orientation,
      toDisplayType,
      isExpanded
    }
  }
}
</script>

<template>
  <div
    :class="[
      'data-el',
      toDisplayType(dataType, true),
      {
        'high-density': highDensity,
        dim: dimAfter !== -1 && index >= dimAfter
      }
    ]"
  >
    <div
      v-tooltip="{
        content: $t('StateInspector.dataType.tooltip'),
        html: true,
        placement: orientation === 'landscape' ? 'left' : 'top'
      }"
      class="data-type selectable-item"
      @click="$emit('toggle', dataType, isExpanded, $event)"
    >
      <span
        :class="{ rotated: isExpanded }"
        class="arrow right"
      />
      <span class="key flex-1 flex items-center space-x-2">
        <span class="relative key-label">
          <slot
            name="key"
            :dataType="dataType"
          >
            {{ toDisplayType(dataType) }}
          </slot>
        </span>

        <PluginSourceIcon
          v-if="plugin"
          :plugin-id="plugin.id"
        />
      </span>
    </div>
    <StateFields
      v-show="isExpanded"
      :fields="state[dataType]"
      :force-collapse="forceCollapse"
      @edit-state="(path, payload) => $emit('edit-state', path, payload)"
    />
  </div>
</template>

<style lang="stylus">
.data-el
  font-size 15px

  &.dim
    opacity .7
    pointer-events none
    user-select none
    filter grayscale(50%)

  &:not(:last-child)
    border-bottom rgba($grey, .4) solid 1px

    .vue-ui-dark-mode &
      border-bottom-color rgba($grey, .07)

  .vue-ui-dark-mode &
    box-shadow none

  .data-type,
  .data-fields
    margin 5px
    padding 2px 9px 2px 21px
    @media (max-height: $tall)
      margin 0
      padding 0 9px 0 21px

  .data-type
    color $blueishGrey
    position relative
    cursor pointer
    border-radius 3px
    display flex
    align-items center
    padding-left 9px
    user-select none

    .vue-ui-dark-mode &
      color lighten(#486887, 30%)

    .arrow
      transition transform .1s ease
      margin-right 8px
      opacity .7
      &.rotated
        transform rotate(90deg)

    > .key > .key-label
      top: -1px;

  .data-fields
    padding-top 0
    @media (max-height: $tall)
      margin-bottom 4px

</style>
