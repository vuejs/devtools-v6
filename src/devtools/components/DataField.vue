<template>
  <div class="data-field" :class="cssClass">
    <div class="self"
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
        <span class="value" :class="valueType">{{ formattedValue }}</span>
        <span class="actions">
          <i
            v-if="isEditable"
            class="icon-button edit-value material-icons"
            title="Edit value"
            @click="openEdit"
          >edit</i>
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
  isPlainObject,
  sortByKey,
  parse
} from 'src/util'

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

export default {
  name: 'DataField',
  props: {
    field: Object,
    depth: Number,
    path: String,
    editable: Boolean
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
      }
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
        type === 'string'
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
      } else if (Array.isArray(value)) {
        return 'Array[' + value.length + ']'
      } else if (isPlainObject(value)) {
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
        parse(this.editedValue)
        return true
      } catch (e) {
        return false
      }
    }
  },
  methods: {
    toggle () {
      if (this.isExpandableType) {
        this.expanded = !this.expanded
      }
    },
    hyphen: v => v.replace(/\s/g, '-'),
    openEdit () {
      if (currentEditedField && currentEditedField !== this) {
        currentEditedField.cancelEdit()
      }
      this.editedValue = JSON.stringify(this.field.value)
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
        bridge.send('set-instance-data', {
          id: this.inspectedInstance.id,
          path: this.path,
          value: this.editedValue
        })
      }
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
      font-size 14px
      &:not(:last-child)
        margin-right 4px
    .warning
      color $orange
  &:hover,
  .editing &
    .actions
      visibility visible
  .key
    color #881391
  .colon
    margin-right .5em
    position relative
  .value
    color #444
    &.string, &.native
      color #c41a16
    &.null
      color #999
    &.literal
      color #0033cc

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
</style>
