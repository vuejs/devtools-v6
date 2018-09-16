<template>
  <div class="data-field">
    <v-popover
      :style="{ marginLeft: depth * 14 + 'px' }"
      :disabled="!field.meta"
      :delay="{
        show: 300,
        hide: 0
      }"
      :open-group="'id' + _uid"
      :class="{
        'force-toolbar': contextMenuOpen || editing,
      }"
      class="self"
      popover-class="force-tooltip"
      trigger="hover"
      placement="left"
      offset="24"
      @click.native="onClick"
      @mouseenter.native="onContextMenuMouseEnter"
      @mouseleave.native="onContextMenuMouseLeave"
    >
      <span
        v-show="isExpandableType"
        :class="{ rotated: expanded }"
        class="arrow right"
      />
      <span
        v-if="editing && renamable"
      >
        <input
          ref="keyInput"
          v-model="editedKey"
          class="edit-input key-input"
          :class="{ error: !keyValid }"
          @keydown.esc.capture.stop.prevent="cancelEdit()"
          @keydown.enter="submitEdit()"
        >
      </span>
      <span
        v-else
        :class="{ abstract: fieldOptions.abstract }"
        class="key"
      >{{ field.key }}</span><span
        v-if="!fieldOptions.abstract"
        class="colon"
      >:</span>

      <span
        v-if="editing"
        class="edit-overlay"
      >
        <input
          ref="editInput"
          v-model="editedValue"
          class="edit-input value-input"
          :class="{ error: !valueValid }"
          list="special-tokens"
          @keydown.esc.capture.stop.prevent="cancelEdit()"
          @keydown.enter="submitEdit()"
        >
        <span class="actions">
          <VueIcon
            v-if="!editValid"
            v-tooltip="editErrorMessage"
            class="small-icon warning"
            icon="warning"
          />
          <template v-else>
            <VueButton
              v-tooltip="$t('DataField.edit.cancel.tooltip')"
              class="icon-button flat"
              icon-left="cancel"
              @click="cancelEdit()"
            />
            <VueButton
              v-tooltip="$t('DataField.edit.submit.tooltip')"
              class="icon-button flat"
              icon-left="save"
              @click="submitEdit()"
            />
          </template>
        </span>
      </span>
      <template v-else>
        <!-- eslint-disable vue/no-v-html -->
        <span
          v-tooltip="valueTooltip"
          :class="valueClass"
          class="value"
          @dblclick="openEdit()"
          v-html="formattedValue"
        />
        <!-- eslint-enable vue/no-v-html -->
        <span class="actions">
          <VueButton
            v-if="isValueEditable"
            v-tooltip="'Edit value'"
            class="edit-value icon-button flat"
            icon-left="edit"
            @click="openEdit()"
          />
          <template v-if="quickEdits">
            <VueButton
              v-for="(info, index) of quickEdits"
              :key="index"
              v-tooltip="info.title || 'Quick edit'"
              :class="info.class"
              :icon-left="info.icon"
              class="quick-edit icon-button flat"
              @click="quickEdit(info, $event)"
            />
          </template>
          <VueButton
            v-if="isSubfieldsEditable && !addingValue"
            v-tooltip="'Add new value'"
            class="add-value icon-button flat"
            icon-left="add_circle"
            @click="addNewValue()"
          />
          <VueButton
            v-if="removable"
            v-tooltip="'Remove value'"
            class="remove-field icon-button flat"
            icon-left="delete"
            @click="removeField()"
          />

          <!-- Context menu -->
          <VueDropdown
            :open.sync="contextMenuOpen"
          >
            <VueButton
              slot="trigger"
              icon-left="more_vert"
              class="icon-button flat"
            />

            <div
              class="context-menu-dropdown"
              @mouseenter="onContextMenuMouseEnter"
              @mouseleave="onContextMenuMouseLeave"
            >
              <VueDropdownButton
                icon-left="flip_to_front"
                @click="copyToClipboard"
              >
                {{ $t('DataField.contextMenu.copyValue') }}
              </VueDropdownButton>
            </div>
          </VueDropdown>
        </span>
      </template>

      <div
        v-if="field.meta"
        slot="popover"
        class="meta"
      >
        <div
          v-for="(val, key) in field.meta"
          :key="key"
          class="meta-field"
        >
          <span class="key">{{ key }}</span>
          <span class="value">{{ val }}</span>
        </div>
      </div>
    </v-popover>
    <div
      v-if="expanded && isExpandableType"
      class="children"
    >
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
        :force-collapse="forceCollapse"
        :is-state-field="isStateField"
      />
      <span
        v-if="formattedSubFields.length > limit"
        :style="{ marginLeft: depthMargin + 'px' }"
        class="more"
        @click="limit += 10"
      >
        ...
      </span>
      <data-field
        v-if="isSubfieldsEditable && addingValue"
        ref="newField"
        :field="newField"
        :depth="depth + 1"
        :path="`${path}.${newField.key}`"
        :renamable="valueType === 'plain-object'"
        :force-collapse="forceCollapse"
        editable
        removable
        :is-state-field="isStateField"
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
  sortByKey,
  openInEditor,
  escape,
  specialTokenToString,
  copyToClipboard
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
    field: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    forceCollapse: {
      type: String,
      default: null
    },
    isStateField: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      contextMenuOpen: false,
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
      } else if (type === 'string') {
        if (specialTypeRE.test(value)) {
          const [, type] = specialTypeRE.exec(value)
          return `native ${type}`
        } else {
          return 'string'
        }
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
      let result
      if (this.fieldOptions.abstract) {
        return ''
      } else if ((result = specialTokenToString(value))) {
        return result
      } else if (this.valueType === 'custom') {
        return value._custom.display
      } else if (this.valueType === 'array') {
        return 'Array[' + value.length + ']'
      } else if (this.valueType === 'plain-object') {
        return 'Object' + (Object.keys(value).length ? '' : ' (empty)')
      } else if (this.valueType.includes('native')) {
        return escape(specialTypeRE.exec(value)[2])
      } else if (typeof value === 'string') {
        var typeMatch = value.match(rawTypeRE)
        if (typeMatch) {
          return escape(typeMatch[1])
        } else {
          return `<span>"</span>${escape(value)}<span>"</span>`
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
        value = Object.keys(value).map(key => ({
          key,
          value: value[key],
          ...inherit
        }))
        if (this.valueType !== 'custom') {
          value = sortByKey(value)
        }
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
      } else if (type.indexOf('native ') === 0) {
        return type.substr('native '.length)
      } else {
        return null
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
        return 'Invalid value (must be valid JSON)'
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

  watch: {
    forceCollapse: {
      handler (value) {
        if (value === 'expand' && this.depth < 4) {
          this.expanded = true
        } else if (value === 'collapse') {
          this.expanded = false
        }
      },
      immediate: true
    }
  },

  methods: {
    copyToClipboard () {
      copyToClipboard(this.field.value)
    },

    onClick (event) {
      // Cancel if target is interactive
      if (event.target.tagName === 'INPUT' || event.target.className.includes('button')) {
        return
      }

      // CustomValue API `file`
      if (this.valueType === 'custom' && this.fieldOptions.file) {
        return openInEditor(this.fieldOptions.file)
      }
      if (this.valueType === 'custom' && this.fieldOptions['type'] === '$refs') {
        if (this.$isChrome) {
          const evl = `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get("${this.fieldOptions.uid}").$refs["${this.fieldOptions.key}"])`
          console.log(evl)
          chrome.devtools.inspectedWindow.eval(evl)
        } else {
          window.alert('DOM inspection is not supported in this shell.')
        }
      }

      // Default action
      this.toggle()
    },

    toggle () {
      if (this.isExpandableType) {
        this.expanded = !this.expanded

        !this.expanded && this.cancelCurrentEdition()
      }
    },

    hyphen: v => v.replace(/\s/g, '-'),

    onContextMenuMouseEnter () {
      clearTimeout(this.$_contextMenuTimer)
    },

    onContextMenuMouseLeave () {
      clearTimeout(this.$_contextMenuTimer)
      this.$_contextMenuTimer = setTimeout(() => {
        this.contextMenuOpen = false
      }, 4000)
    }
  }
}
</script>

<style lang="stylus" scoped>
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
  .high-density &
    height 14px
    line-height 14px
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
      width 20px
      height @width
      &:first-child
        margin-left 6px
      &:not(:last-child)
        margin-right 6px
    .icon-button >>> .vue-ui-icon,
    .small-icon
      width 16px
      height @width
    .warning >>> svg
      fill $orange
  &:hover,
  &.force-toolbar
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
    .vue-ui-dark-mode &
      color: #242424

  .edit-overlay
    display inline-flex
    align-items center

.key
  color #881391
  .vue-ui-dark-mode &
    color: $lightPink
  &.abstract
    color $blueishGrey
    .vue-ui-dark-mode &
      color lighten($blueishGrey, 20%)
.value
  display inline-block
  color #444
  &.string, &.native
    color $red
  &.string
    >>> span
      color $black
      .vue-ui-dark-mode &
        color $red
  &.null
    color #999
  &.literal
    color $vividBlue
  &.raw-boolean
    width 36px
  &.custom
    &.type-component
      color $green
      &::before,
      &::after
        color $darkGrey
      &::before
        content '<'
      &::after
        content '>'
    &.type-function
      font-style italic
      >>> span
        color $vividBlue
        font-family dejavu sans mono, monospace
        .platform-mac &
          font-family Menlo, monospace
        .platform-windows &
          font-family Consolas, Lucida Console, Courier New, monospace
        .vue-ui-dark-mode &
          color $purple
    &.type-component-definition
      color $green
      >>> span
        color $darkerGrey
    &.type-reference
        opacity 0.5
      >>> .attr-title
        color #800080
  .vue-ui-dark-mode &
    color #bdc6cf
    &.string, &.native
      color #e33e3a
    &.null
      color #999
    &.literal
      color $purple

.meta
  font-size 12px
  font-family Menlo, Consolas, monospace
  min-width 150px
  .key
    display inline-block
    width 80px
    color lighten(#881391, 60%)
    .vue-ui-dark-mode &
      color #881391
  .value
    color white
    .vue-ui-dark-mode &
      color black
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

.context-menu-dropdown
  .vue-ui-button
    display block
    width 100%
</style>
