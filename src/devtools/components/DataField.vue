<template>
  <div class="data-field">
    <span class="key">{{ field.key }}</span>
    <span v-show="field.type" class="type {{ field.type }}">{{ field.type }}</span>
    <span class="colon">:</span>
    <span class="value {{ type }}">
      <span class="arrow right" v-show="isExpandableType"></span>
      <span>{{ formattedValue }}</span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'DataField',
  props: {
    field: Object
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
        return 'Array (' + value.length + ')'
      } else if (value && typeof value === 'object') {
        return 'Object (' + Object.keys(value).length + ')'
      } else if (typeof value === 'string') {
        return JSON.stringify(value)
      } else {
        return value
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.data-field
  display flex
.key
  color #f33
.value
  color #666
  &.string
    color green
.type
  color #33f
</style>
