<template>
  <div class="data-wrapper">
    <div
      v-for="dataType in dataTypes"
      :class="['data-el', toDisplayType(dataType, true)]"
    >
      <div
        class="data-type selectable-item"
        title="Ctrl+Click: Collapse All
Shift+Click: Expand All"
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
  undefined: 1,
  props: 2,
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
        if (event.ctrlKey) {
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
  font-size 14px

  &:not(:last-child)
    border-bottom rgba($grey, .4) solid 1px

  .app.dark &
    box-shadow none

  .data-type,
  .data-fields
    margin 5px
    padding 2px 9px 2px 21px

  .data-type
    color $green
    position relative
    cursor pointer
    border-radius 3px

    .arrow
      position absolute
      top 9px
      left 7px
      transition transform .1s ease
      &.rotated
        transform rotate(90deg)

  .data-fields
    padding-top 0

</style>
