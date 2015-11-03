<template>
  <div class="data-field">
    <div class="self"
      @click="toggle"
      :style="{ marginLeft: depth * 14 + 14 + 'px' }">
      <span
        class="arrow right"
        :class="{ rotated: expanded }"
        v-show="isExpandableType">
      </span>
      <span class="key">{{ field.key }}</span><span class="colon">:</span>
      <span class="value {{ type }}">{{ formattedValue }}</span>
      <div class="type {{ field.type }}" v-show="field.type" >
        {{ field.type }}
        <div class="meta" v-if="field.meta">
          <div class="meta-field" v-for="(key, val) in field.meta">
            <span class="key">{{ key }}</span>
            <span class="value">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="children" v-if="expanded">
      <data-field
        v-for="subField in field.value | formatSubFields"
        track-by="$index"
        :field="subField"
        :depth="depth + 1">
      </data-field>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataField',
  props: {
    field: Object,
    depth: Number
  },
  data () {
    return {
      expanded: false
    }
  },
  computed: {
    type () {
      return typeof this.field.value
    },
    isExpandableType () {
      let value = this.field.value
      return value && typeof value === 'object'
    },
    formattedValue () {
      let value = this.field.value
      if (Array.isArray(value)) {
        return 'Array[' + value.length + ']'
      } else if (value && typeof value === 'object') {
        return 'Object' + (Object.keys(value).length ? '' : ' (empty)')
      } else if (typeof value === 'string') {
        return JSON.stringify(value)
      } else {
        return value
      }
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
    formatSubFields (value) {
      if (Array.isArray(value)) {
        return value.map((item, i) => ({
          key: i,
          value: item
        }))
      } else {
        return Object.keys(value).map(key => ({
          key,
          value: value[key]
        }))
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.data-field
  font-size 12px
  font-family Menlo, Consolas, monospace
  cursor default
.self
  height 20px
  line-height 20px
  position relative
  white-space nowrap
  span, div
    display inline-block
    vertical-align middle
  .arrow
    position absolute
    top 7px
    left -14px
    &.rotated
      transform rotate(90deg)
  .key
    color #881391
  .value
    color #444
    &.string
      color #c41a16
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
</style>
