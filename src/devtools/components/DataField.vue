<template>
  <div class="data-field">
    <div class="self"
      @click="toggle"
      :style="{ marginLeft: depth * 14 + 'px' }">
      <span
        class="arrow right"
        :class="{ rotated: expanded }"
        v-show="isExpandableType">
      </span>
      <span class="key">{{ field.key }}</span><span class="colon">:</span>
      <span class="value" :class="valueType">{{ formattedValue }}</span>
      <div v-if="field.type" class="type {{ field.type | hyphen }}">
        {{ field.type }}
        <div class="meta" v-if="field.meta">
          <div class="meta-field" v-for="(key, val) in field.meta">
            <span class="key">{{ key }}</span>
            <span class="value">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="children" v-if="expanded && isExpandableType">
      <data-field
        v-for="subField in formattedSubFields | limitBy limit"
        track-by="$index"
        :field="subField"
        :depth="depth + 1">
      </data-field>
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
const rawTypeRE = /^\[object (\w+)\]$/

function isPlainObject (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export default {
  name: 'DataField',
  props: {
    field: Object,
    depth: Number
  },
  data () {
    return {
      limit: Array.isArray(this.field.value) ? 10 : Infinity,
      expanded: this.depth === 0
    }
  },
  computed: {
    valueType () {
      let value = this.field.value
      let type = typeof value
      if (value == null) {
        return 'null'
      } else if (
        value instanceof RegExp ||
        (type === 'string' && !rawTypeRE.test(value))
      ) {
        return 'string'
      } else if (type === 'boolean' || type === 'number') {
        return 'literal'
      }
    },
    isExpandableType () {
      let value = this.field.value
      return Array.isArray(value) || isPlainObject(value)
    },
    formattedValue () {
      let value = this.field.value
      if (Array.isArray(value)) {
        return 'Array[' + value.length + ']'
      } else if (isPlainObject(value)) {
        return 'Object' + (Object.keys(value).length ? '' : ' (empty)')
      } else if (typeof value === 'string') {
        var typeMatch = value.match(rawTypeRE)
        if (typeMatch) {
          return typeMatch[1]
        } else {
          return JSON.stringify(value)
        }
      } else if (value instanceof RegExp) {
        return value.toString()
      } else if (value == null) {
        return value === undefined ? 'undefined' : 'null'
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
        value = Object.keys(value).map(key => ({
          key,
          value: value[key]
        }))
      }
      return value
    }
  },
  methods: {
    toggle () {
      if (this.isExpandableType) {
        this.expanded = !this.expanded
      }
    }
  },
  filters: {
    hyphen: v => v.replace(/\s/g, '-')
  }
}
</script>

<style lang="stylus" scoped>
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
    &.rotated
      transform rotate(90deg)
  .key
    color #881391
  .value
    color #444
    &.string
      color #c41a16
    &.null
      color #999
    &.literal
      color #0033cc
  .type
    color #fff
    padding 3px 6px
    font-size 10px
    line-height 10px
    height 16px
    border-radius 3px
    margin 2px 0
    position relative
    &.prop
      background-color #b3cbf7
      &:hover
        cursor pointer
        .meta
          display block
    &.computed
      background-color #D2BBFF
    &.vuex-getter
      background-color #5dd5d5
    &.firebase-binding
      background-color #ffcc00
    .meta
      display none
      position absolute
      z-index 999
      font-size 11px
      color #444
      top 0
      left calc(100% + 4px)
      width 170px
      border 1px solid #e3e3e3
      border-radius 3px
      padding 8px 12px
      background-color #fff
      line-height 16px
      box-shadow 0 2px 12px rgba(0,0,0,.1)
      .key
        width 90px
    .meta-field
      display block

.more
  cursor pointer
  display inline-block
  border-radius 4px
  padding 0 4px 4px
  &:hover
    background-color #eee
</style>
