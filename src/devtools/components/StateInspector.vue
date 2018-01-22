<template>
  <div class="data-wrapper">
    <div
      v-for="dataType in dataTypes"
      :class="['data-el', toDisplayType(dataType, true)]"
    >
      <div
        class="data-type selectable-item"
        v-tooltip="$t('StateInspector.dataType.tooltip')"
        @click="toggle(dataType, $event)"
      >
        <span
          class="arrow right"
          :class="{ rotated: isExpanded(dataType) }"
        ></span>
        <span class="key">{{ toDisplayType(dataType) }}</span>
      </div>
      <div v-show="isExpanded(dataType)" class="data-fields">
        <template v-if="Array.isArray(state[dataType])">
          <data-field
            v-for="field in state[dataType]"
            :key="field.key"
            :field="field"
            :depth="0"
            :path="field.key"
            :editable="field.editable">
          </data-field>
        </template>
        <template v-else>
          <data-field
            v-for="(value, key) in state[dataType]"
            :key="key"
            :field="{ value, key }"
            :depth="0"
            :path="key"
            :editable="false">
          </data-field>
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
  undefined: 2,
  computed: 3,
  state: 1,
  getters: 2
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
      expandedState: {}
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
        Vue.set(this.expandedState, key, value)
      })
    }
  }
}
</script>

<style lang="stylus">
@import "../variables"

.data-el
  font-size 15px

  &:not(:last-child)
    border-bottom rgba($grey, .4) solid 1px

    .dark &
      border-bottom-color rgba($grey, .07)

  .dark &
    box-shadow none

  .data-type,
  .data-fields
    margin 5px
    padding 2px 9px 2px 21px

  .data-type
    color $blueishGrey
    position relative
    cursor pointer
    border-radius 3px
    display flex
    align-items baseline
    padding-left 9px

    .dark &
      color lighten(#486887, 30%)

    .arrow
      transition transform .1s ease
      margin-right 8px
      opacity .7
      &.rotated
        transform rotate(90deg)

  .data-fields
    padding-top 0

</style>
