<template>
  <div class="data-wrapper">
    <div
      v-for="dataType in dataTypes"
      :key="dataType"
      :class="[
        'data-el',
        toDisplayType(dataType, true),
        {
          'high-density': highDensity
        }
      ]"
    >
      <div
        v-tooltip="$t('StateInspector.dataType.tooltip')"
        class="data-type selectable-item"
        @click="toggle(dataType, $event)"
      >
        <span
          :class="{ rotated: isExpanded(dataType) }"
          class="arrow right"
        />
        <span class="key">{{ toDisplayType(dataType) }}</span>
      </div>
      <div
        v-show="isExpanded(dataType)"
        class="data-fields"
      >
        <template v-if="Array.isArray(state[dataType])">
          <data-field
            v-for="field in state[dataType]"
            :key="field.key"
            :field="field"
            :depth="0"
            :path="field.key"
            :editable="field.editable"
            :force-collapse="forceCollapse"
            :is-state-field="isStateField(field)"
          />
        </template>
        <template v-else>
          <data-field
            v-for="(value, key) in state[dataType]"
            :key="key"
            :field="{ value, key }"
            :depth="0"
            :path="key"
            :editable="false"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import DataField from './DataField.vue'

const keyOrder = {
  props: 1,
  undefined: 3,
  computed: 4,
  state: 2,
  getters: 3,
  mutation: 1,
  'vuex bindings': 5,
  $refs: 6,
  $attrs: 7
}

export default {
  components: {
    DataField
  },

  props: {
    state: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      expandedState: {},
      forceCollapse: null
    }
  },

  computed: {
    dataTypes () {
      return Object.keys(this.state).sort((a, b) => {
        return (
          (keyOrder[a] || (a.charCodeAt(0) + 999)) -
          (keyOrder[b] || (b.charCodeAt(0) + 999))
        )
      })
    },

    totalCount () {
      return Object.keys(this.state).reduce((total, state) => total + state.length, 0)
    },

    highDensity () {
      const pref = this.$shared.displayDensity
      return (pref === 'auto' && this.totalCount > 12) || pref === 'high'
    }
  },

  watch: {
    state () {
      this.forceCollapse = null
    }
  },

  methods: {
    toDisplayType (dataType, asClass) {
      return dataType === 'undefined'
        ? 'data'
        : asClass
          ? dataType.replace(/\s/g, '-')
          : dataType
    },

    isExpanded (dataType) {
      const value = this.expandedState[dataType]
      return typeof value === 'undefined' || value
    },

    toggle (dataType, event = null) {
      if (event) {
        if (event.ctrlKey || event.metaKey) {
          return this.setExpandToAll(false)
        } else if (event.shiftKey) {
          return this.setExpandToAll(true)
        }
      }
      Vue.set(this.expandedState, dataType, !this.isExpanded(dataType))
    },

    setExpandToAll (value) {
      this.dataTypes.forEach(key => {
        this.forceCollapse = value ? 'expand' : 'collapse'
        Vue.set(this.expandedState, key, value)
      })
    },

    isStateField (field) {
      return field && field.type === 'state'
    }
  }
}
</script>

<style lang="stylus">
.data-el
  font-size 15px

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
    align-items baseline
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

  .data-fields
    padding-top 0
    @media (max-height: $tall)
      margin-bottom 4px

</style>
