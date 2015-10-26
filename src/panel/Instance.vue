<template>
  <div class="instance" :class="classes">
    <span>{{ instance.inactive ? '(inactive)' : '' }}</span>
    <span class="name">{{ instance.name }}</span>
    <a class="inspect" @click.stop="select">
      Inspect
    </a>
    <a class="toggle"
      v-if="instance.children.length"
      @click.stop="expanded = !expanded">
      {{ expanded ? '[-]' : '[+]' }}
    </a>
    <template v-if="expanded">
      <instance
        v-for="child in instance.children | orderBy 'inactive'"
        track-by="id"
        :instance="child">
      </instance>
    </template>
  </div>
</template>

<script>
export default {
  name: 'Instance',
  props: {
    instance: Object
  },
  data () {
    return {
      expanded: false,
      selected: false
    }
  },
  computed: {
    classes () {
      return {
        selected: this.selected,
        inactive: this.instance.inactive
      }
    }
  },
  methods: {
    select () {
      this.selected = true
      this.$dispatch('selected', this)
    }
  }
}
</script>

<style lang="stylus" scoped>
.name
  font-weight: bold

.instance
  border 1px solid #eee
  padding 10px 20px
  cursor pointer
  &.selected
    border-color red
  &.inactive
    opacity .5
</style>
