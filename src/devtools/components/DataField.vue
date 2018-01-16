<template>
  <div class="data-field">
    <v-popover
      class="self"
      :class="cssClass"
      :style="{ marginLeft: depth * 14 + 'px' }"
      trigger="hover"
      placement="left"
      offset="24"
      :disabled="!field.meta"
      @click.native="toggle"
    >
      <span
        v-show="isExpandableType"
        class="arrow right"
        :class="{ rotated: expanded }"
      ></span>
      <span
        v-if="editing && renamable"
      >
        <input
          ref="keyInput"
          class="edit-input key-input"
          :class="{ error: !keyValid }"
          v-model="editedKey"
          @keyup.esc="cancelEdit()"
          @keyup.enter="submitEdit()"
        >
      </span>
      <span v-else class="key" :class="{ abstract: fieldOptions.abstract }">{{ field.key }}</span><span class="colon" v-if="!fieldOptions.abstract">:</span>

      <span
        v-if="editing"
        class="edit-overlay"
      >
        <input
          ref="editInput"
          class="edit-input value-input"
          :class="{ error: !valueValid }"
          v-model="editedValue"
          list="special-tokens"
          @keyup.esc="cancelEdit()"
          @keyup.enter="submitEdit()"
        >
        <span class="actions">
          <i
            v-if="!editValid"
            class="icon-button material-icons warning"
            v-tooltip="editErrorMessage"
          >warning</i>
          <template v-else>
            <i
              class="icon-button material-icons"
              v-tooltip="cancelEditTooltip"
              @click="cancelEdit()"
            >close</i>
            <i
              class="icon-button material-icons"
              v-tooltip="submitEditTooltip"
              @click="submitEdit()"
            >done</i>
          </template>
        </span>
      </span>
      <template v-else>
        <span
          class="value"
          :class="valueClass"
          @dblclick="openEdit()"
          v-tooltip="valueTooltip"
          v-html="formattedValue"
        />
        <span class="actions">
          <i
            v-if="isValueEditable"
            class="edit-value icon-button material-icons"
            v-tooltip="'Edit value'"
            @click="openEdit()"
          >edit</i>
          <template v-if="quickEdits">
            <i
              v-for="(info, index) of quickEdits"
              :key="index"
              class="quick-edit icon-button material-icons"
              v-tooltip="info.title || 'Quick edit'"
              @click="quickEdit(info, $event)"
            >{{ info.icon }}</i>
          </template>
          <i
            v-if="isSubfieldsEditable && !addingValue"
            class="add-value icon-button material-icons"
            v-tooltip="'Add new value'"
            @click="addNewValue()"
          >add_circle</i>
          <i
            v-if="removable"
            class="remove-field icon-button material-icons"
            v-tooltip="'Remove value'"
            @click="removeField()"
          >delete</i>
        </span>
      </template>

      <div slot="popover" class="meta" v-if="field.meta">
        <div class="meta-field" v-for="(val, key) in field.meta">
          <span class="key">{{ key }}</span>
          <span class="value">{{ val }}</span>
        </div>
      </div>
    </v-popover>
    <div class="children" v-if="expanded && isExpandableType">
      <data-field
        v-for="subField in limitedSubFields"
        :key="subField.key"
        :field="subField"
        :parent-field="field"
        :depth="depth + 1"
        :path="`${path}.${subField.key}`"
        :editable="isEditable"
        :removable="isSubfieldsEditable"
        :renamable="editable && valueType === 'plain-object'"
      />
      <span class="more"
        v-if="formattedSubFields.length > limit"
        @click="limit += 10"
        :style="{ marginLeft: depthMargin + 'px' }">
        ...
      </span>
      <data-field
        v-if="isSubfieldsEditable && addingValue"
        ref="newField"
        :field="newField"
        :parent-field="field"
        :depth="depth + 1"
        :path="`${path}.${newField.key}`"
        editable
        removable
        :renamable="valueType === 'plain-object'"
        @cancel-edit="addingValue = false"
        @submit-edit="addingValue = false"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  UNDEFINED,
  INFINITY,
  NEGATIVE_INFINITY,
  NAN,
  isPlainObject,
  sortByKey
} from 'src/util'

import DataFieldEdit from '../mixins/data-field-edit'

const rawTypeRE = /^\[object (\w+)]$/
const specialTypeRE = /^\[native (\w+) (.*)\]$/

function subFieldCount (value) {
  if (Array.isArray(value)) {
    return value.length
  } else if (value && typeof value === 'object') {
    return Object.keys(value).length
  } else {
    return 0
  }
}

export default {
  name: 'DataField',

  mixins: [
    DataFieldEdit
  ],

  props: {
    field: Object,
    parentField: Object,
    depth: Number,
    path: String
  },

  data () {
    return {
      limit: Array.isArray(this.field.value) ? 10 : Infinity,
      expanded: this.depth === 0 && this.field.key !== '$route' && (subFieldCount(this.field.value) < 5)
    }
  },

  computed: {
    ...mapState('components', [
      'inspectedInstance'
    ]),

    depthMargin () {
      return (this.depth + 1) * 14 + 10
    },

    valueType () {
      const value = this.field.value
      const type = typeof value
      if (value == null || value === UNDEFINED) {
        return 'null'
      } else if (
        type === 'boolean' ||
        type === 'number' ||
        value === INFINITY ||
        value === NEGATIVE_INFINITY ||
        value === NAN
      ) {
        return 'literal'
      } else if (value && value._custom) {
        return 'custom'
      } else if (specialTypeRE.test(value)) {
        const [, type] = specialTypeRE.exec(value)
        return `native ${type}`
      } else if (type === 'string' && !rawTypeRE.test(value)) {
        return 'string'
      } else if (Array.isArray(value)) {
        return 'array'
      } else if (isPlainObject(value)) {
        return 'plain-object'
      } else {
        return 'unknown'
      }
    },

    rawValueType () {
      return typeof this.field.value
    },

    isExpandableType () {
      let value = this.field.value
      if (this.valueType === 'custom') {
        value = value._custom.value
      }
      const closed = this.fieldOptions.closed
      const closedDefined = typeof closed !== 'undefined'
      return (!closedDefined &&
        (
          Array.isArray(value) ||
          isPlainObject(value)
        )) ||
        (
          closedDefined &&
          !closed
        )
    },

    formattedValue () {
      const value = this.field.value
      if (this.fieldOptions.abstract) {
        return ''
      } else if (value === null) {
        return 'null'
      } else if (value === UNDEFINED) {
        return 'undefined'
      } else if (value === NAN) {
        return 'NaN'
      } else if (value === INFINITY) {
        return 'Infinity'
      } else if (value === NEGATIVE_INFINITY) {
        return '-Infinity'
      } else if (this.valueType === 'custom') {
        return value._custom.display
      } else if (this.valueType === 'array') {
        return 'Array[' + value.length + ']'
      } else if (this.valueType === 'plain-object') {
        return 'Object' + (Object.keys(value).length ? '' : ' (empty)')
      } else if (this.valueType.includes('native')) {
        return specialTypeRE.exec(value)[2]
      } else if (typeof value === 'string') {
        var typeMatch = value.match(rawTypeRE)
        if (typeMatch) {
          return typeMatch[1]
        } else {
          return JSON.stringify(value)
        }
      } else {
        return value
      }
    },

    formattedSubFields () {
      let value = this.field.value

      // CustomValue API
      const isCustom = this.valueType === 'custom'
      let inherit = {}
      if (isCustom) {
        inherit = value._custom.fields || {}
        value = value._custom.value
      }

      if (Array.isArray(value)) {
        value = value.map((item, i) => ({
          key: i,
          value: item,
          ...inherit
        }))
      } else if (typeof value === 'object') {
        value = sortByKey(Object.keys(value).map(key => ({
          key,
          value: value[key],
          ...inherit
        })))
      }
      return value
    },

    limitedSubFields () {
      return this.formattedSubFields.slice(0, this.limit)
    },

    valueTooltip () {
      const type = this.valueType
      if (type === 'custom') {
        return this.field.value._custom.tooltip
      } else if (type.indexOf('native ' === 0)) {
        return type.substr('native '.length)
      }
    },

    fieldOptions () {
      if (this.valueType === 'custom') {
        return Object.assign({}, this.field, this.field.value._custom)
      } else {
        return this.field
      }
    },

    editErrorMessage () {
      if (!this.valueValid) {
        return 'Invalid value'
      } else if (!this.keyValid) {
        if (this.duplicateKey) {
          return 'Duplicate key'
        } else {
          return 'Invalid key'
        }
      }
    },

    valueClass () {
      const cssClass = [this.valueType, `raw-${this.rawValueType}`]
      if (this.valueType === 'custom') {
        const value = this.field.value
        value._custom.type && cssClass.push(`type-${value._custom.type}`)
        value._custom.class && cssClass.push(value._custom.class)
      }
      return cssClass
    }
  },

  methods: {
    toggle (event) {
      if (event.target.tagName === 'INPUT' || event.target.className.includes('button')) {
        return
      }
      if (this.isExpandableType) {
        this.expanded = !this.expanded

        !this.expanded && this.cancelCurrentEdition()
      }
    },

    hyphen: v => v.replace(/\s/g, '-')
  }
}
</script>

<style lang="stylus" scoped>
@import "../variables"

.data-field
  user-select text
  font-size 12px
  font-family Menlo, Consolas, monospace
  cursor pointer

.self
  height 20px
  line-height 20px
  position relative
  white-space nowrap
  padding-left 14px
  span, div
    display inline-block
    vertical-align middle
  .arrow
    position absolute
    top 7px
    left 0px
    transition transform .1s ease
    &.rotated
      transform rotate(90deg)
  .actions
    visibility hidden
    display inline-flex
    align-items center
    position relative
    top -1px
    .icon-button
      user-select none
      font-size 14px
      &:first-child
        margin-left 6px
      &:not(:last-child)
        margin-right 6px
    .warning
      color $orange
  &:hover,
  &.editing
    .actions
      visibility visible
  .colon
    margin-right .5em
    position relative

  .type
    color $background-color
    padding 3px 6px
    font-size 10px
    line-height 10px
    height 16px
    border-radius 3px
    margin 2px 6px
    position relative
    background-color #eee
    &.prop
      background-color #96afdd
    &.computed
      background-color #af90d5
    &.vuex-getter
      background-color #5dd5d5
    &.firebase-binding
      background-color #ffcc00
    &.observable
      background-color #ff9999
    .dark &
      color: #242424

.key
  color #881391
  .dark &
    color: #e36eec
  &.abstract
    color $blueishGrey
.value
  display inline-block
  color #444
  &.string, &.native
    color $red
  &.null
    color #999
  &.literal
    color #0033cc
  &.raw-boolean
    width 36px
  &.custom
    &.type-component
      color $green
      &::before,
      &::after
        color $darkerGrey
      &::before
        content '<'
      &::after
        content '>'
    &.type-function
      >>> span
        color $green
    &.type-component-definition
      color $green
      >>> span
        color $darkerGrey
  .dark &
    color #bdc6cf
    &.string, &.native
      color #e33e3a
    &.null
      color #999
    &.literal
      color #997fff

.meta
  font-size 12px
  font-family Menlo, Consolas, monospace
  color #444
  min-width 150px
  .key
    display inline-block
    width 80px
.meta-field
  &:not(:last-child)
    margin-bottom 4px

.more
  cursor pointer
  display inline-block
  border-radius 4px
  padding 0 4px 4px
  &:hover
    background-color #eee

.edit-input
  font-family Menlo, Consolas, monospace
  border solid 1px $green
  border-radius 3px
  padding 2px
  outline none
  &.error
    border-color $orange
.value-input
  width 180px
.key-input
  width 90px
  color #881391

.remove-field
  margin-left 10px
</style>
