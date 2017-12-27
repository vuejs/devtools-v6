<template>
  <div class="data-field">
    <div class="self"
      :class="cssClass"
      @click="toggle"
      :style="{ marginLeft: depth * 14 + 'px' }">
      <span
        class="arrow right"
        :class="{ rotated: expanded }"
        v-show="isExpandableType">
      </span>
      <span class="key">{{ field.key }}</span>
      <span class="colon">:<div class="meta" v-if="field.meta">
        <div class="meta-field" v-for="(val, key) in field.meta">
          <span class="key">{{ key }}</span>
          <span class="value">{{ val }}</span>
        </div>
      </div></span>
      <span
        v-if="editing"
        class="edit-overlay"
      >
        <input
          ref="editInput"
          class="edit-input"
          v-model="editedValue"
          list="special-tokens"
          @keyup.esc="cancelEdit"
          @keyup.enter="submitEdit"
        >
        <span class="actions">
          <i
            v-if="!editValid"
            class="icon-button material-icons warning"
            title="Invalid value"
          >warning</i>
          <template v-else>
            <i
              class="icon-button material-icons"
              title="[Esc] Cancel"
              @click="cancelEdit"
            >close</i>
            <i
              class="icon-button material-icons"
              title="[Enter] Submit change"
              @click="submitEdit"
            >done</i>
          </template>
        </span>
      </span>
      <template v-else>
        <span
          class="value"
          :class="[valueType, `raw-${rawValueType}`]"
        >{{ formattedValue }}</span>
        <span class="actions">
          <i
            v-if="isEditable"
            class="edit-value icon-button material-icons"
            title="Edit value"
            @click="openEdit"
          >edit</i>
          <template v-if="quickEdits">
            <i
              v-for="(info, index) of quickEdits"
              :key="index"
              class="quick-edit icon-button material-icons"
              :title="info.title || 'Quick edit'"
              @click="quickEdit(info, $event)"
            >{{ info.icon }}</i>
          </template>
          <i
            v-if="removable"
            class="remove-field icon-button material-icons"
            title="Remove value"
            @click="removeField"
          >delete</i>
        </span>
      </template>
    </div>
    <div class="children" v-if="expanded && isExpandableType">
      <data-field
        v-for="subField in limitedSubFields"
        :key="subField.key"
        :field="subField"
        :depth="depth + 1"
        :path="`${path}.${subField.key}`"
        :editable="editable"
        :removable="valueType === 'array' || valueType === 'plain-object'"
        @remove-field="onRemoveField(subField)"
      />
      <span class="more"
        v-if="formattedSubFields.length > limit"
        @click="limit += 10"
        :style="{ marginLeft: (depth + 1) * 14 + 10 + 'px' }">
        ...
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  UNDEFINED,
  INFINITY,
  NAN,
  SPECIAL_TOKENS,
  isPlainObject,
  sortByKey,
  parse
} from 'src/util'

const QUICK_EDIT_NUMBER_REMOVE = `Quick Edit
[Ctrl-Click] -5
[Shift-Click] -10
[Alt-Click] -100`

const QUICK_EDIT_NUMBER_ADD = `Quick Edit
[Ctrl-Click] +5
[Shift-Click] +10
[Alt-Click] +100`

const rawTypeRE = /^\[object (\w+)]$/
const specialTypeRE = /^\[native \w+ (.*)\]$/

let currentEditedField = null

function subFieldCount (value) {
  if (Array.isArray(value)) {
    return value.length
  } else if (value && typeof value === 'object') {
    return Object.keys(value).length
  } else {
    return 0
  }
}

function numberQuickEditMod (event) {
  let mod = 1
  if (event.ctrlKey) {
    mod *= 5
  }
  if (event.shiftKey) {
    mod *= 10
  }
  if (event.altKey) {
    mod *= 100
  }
  return mod
}

export default {
  name: 'DataField',
  props: {
    field: Object,
    depth: Number,
    path: String,
    editable: Boolean,
    removable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      limit: Array.isArray(this.field.value) ? 10 : Infinity,
      expanded: this.depth === 0 && this.field.key !== '$route' && (subFieldCount(this.field.value) < 5),
      editing: false,
      editedValue: null
    }
  },
  computed: {
    ...mapState('components', [
      'inspectedInstance'
    ]),
    cssClass () {
      return {
        editing: this.editing
      }
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
        value === NAN
      ) {
        return 'literal'
      } else if (specialTypeRE.test(value)) {
        return 'native'
      } else if (type === 'string' && !rawTypeRE.test(value)) {
        return 'string'
      } else if (Array.isArray(value)) {
        return 'array'
      } else if (isPlainObject(value)) {
        return 'plain-object'
      }
    },
    rawValueType () {
      return typeof this.field.value
    },
    isExpandableType () {
      const value = this.field.value
      return Array.isArray(value) || isPlainObject(value)
    },
    isEditable () {
      const type = this.valueType
      return this.editable && (
        type === 'null' ||
        type === 'literal' ||
        type === 'string' ||
        type === 'array' ||
        type === 'plain-object'
      )
    },
    formattedValue () {
      const value = this.field.value
      if (value === null) {
        return 'null'
      } else if (value === UNDEFINED) {
        return 'undefined'
      } else if (value === NAN) {
        return 'NaN'
      } else if (value === INFINITY) {
        return 'Infinity'
      } else if (this.valueType === 'array') {
        return 'Array[' + value.length + ']'
      } else if (this.valueType === 'plain-object') {
        return 'Object' + (Object.keys(value).length ? '' : ' (empty)')
      } else if (this.valueType === 'native') {
        return specialTypeRE.exec(value)[1]
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
      if (Array.isArray(value)) {
        value = value.map((item, i) => ({
          key: i,
          value: item
        }))
      } else if (typeof value === 'object') {
        value = sortByKey(Object.keys(value).map(key => ({
          key,
          value: value[key]
        })))
      }
      return value
    },
    limitedSubFields () {
      return this.formattedSubFields.slice(0, this.limit)
    },
    editValid () {
      try {
        parse(this.transformSpecialTokens(this.editedValue, false))
        return true
      } catch (e) {
        return false
      }
    },
    quickEdits () {
      if (this.isEditable) {
        const value = this.field.value
        const type = typeof value
        if (type === 'boolean') {
          return [
            {
              icon: value ? 'check_box' : 'check_box_outline_blank',
              newValue: !value
            }
          ]
        } else if (type === 'number') {
          return [
            {
              icon: 'remove',
              title: QUICK_EDIT_NUMBER_REMOVE,
              newValue: event => value - numberQuickEditMod(event)
            },
            {
              icon: 'add',
              title: QUICK_EDIT_NUMBER_ADD,
              newValue: event => value + numberQuickEditMod(event)
            }
          ]
        }
      }
      return null
    }
  },
  methods: {
    toggle (event) {
      if (event.target.tagName === 'INPUT' || event.target.className.includes('button')) {
        return
      }
      if (this.isExpandableType) {
        this.expanded = !this.expanded
      }
    },
    hyphen: v => v.replace(/\s/g, '-'),
    openEdit () {
      if (currentEditedField && currentEditedField !== this) {
        currentEditedField.cancelEdit()
      }
      this.editedValue = this.transformSpecialTokens(JSON.stringify(this.field.value), true)
      this.editing = true
      currentEditedField = this
      this.$nextTick(() => {
        const el = this.$refs.editInput
        el.focus()
        el.setSelectionRange(0, el.value.length)
      })
    },
    cancelEdit () {
      this.editing = false
    },
    submitEdit () {
      if (this.editValid) {
        this.editing = false
        const value = this.transformSpecialTokens(this.editedValue, false)
        this.sendEdit(value)
      }
    },
    sendEdit (value) {
      bridge.send('set-instance-data', {
        id: this.inspectedInstance.id,
        path: this.path,
        value
      })
    },
    transformSpecialTokens (str, display) {
      Object.keys(SPECIAL_TOKENS).forEach(key => {
        const value = JSON.stringify(SPECIAL_TOKENS[key])
        let search
        let replace
        if (display) {
          search = value
          replace = key
        } else {
          search = key
          replace = value
        }
        str = str.replace(new RegExp(search), replace)
      })
      return str
    },
    quickEdit (info, event) {
      let newValue
      if (typeof info.newValue === 'function') {
        newValue = info.newValue(event)
      } else {
        newValue = info.newValue
      }
      this.sendEdit(JSON.stringify(newValue))
    },
    removeField () {
      this.$emit('remove-field')
    },
    onRemoveField (subField) {
      const newValue = this.field.value
      if (this.valueType === 'array') {
        newValue.splice(subField.key, 1)
      } else if (this.valueType === 'plain-object') {
        delete newValue[subField.key]
      }
      this.sendEdit(JSON.stringify(newValue))
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../variables"

.data-field
  user-select text
  font-size 12px
  font-family Menlo, Consolas, monospace
  cursor default

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
    margin-left 6px
    display inline-flex
    align-items center
    position relative
    top -1px
    .icon-button
      user-select none
      font-size 14px
      &:not(:last-child)
        margin-right 4px
    .warning
      color $orange
  &:hover,
  &.editing
    .actions
      visibility visible
  .key
    color #881391
  .colon
    margin-right .5em
    position relative
  .value
    display inline-block
    color #444
    &.string, &.native
      color #c41a16
    &.null
      color #999
    &.literal
      color #0033cc
    &.raw-boolean
      width 36px

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

  .meta
    display none
    position absolute
    z-index 999
    font-size 11px
    color #444
    top 0
    left calc(100% + 5px)
    width 150px
    border 1px solid #e3e3e3
    border-radius 3px
    padding 8px 12px
    background-color $background-color
    line-height 16px
    box-shadow 0 2px 12px rgba(0,0,0,.1)
    .key
      width 65px
  .meta-field
    display block
  &:hover
    cursor pointer
    .meta
      display block

  .app.dark &
    .key
      color: #e36eec
    .value
      color #bdc6cf
      &.string, &.native
        color #e33e3a
      &.null
        color #999
      &.literal
        color #997fff
    .type
      color: #242424
      .meta
        border 1px solid $dark-border-color
        background-color $dark-background-color


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
  width 200px

.remove-field
  margin-left 10px
</style>
