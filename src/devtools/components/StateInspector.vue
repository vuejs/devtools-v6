<template>
  <div class="data-wrapper">
    <div v-for="type in Object.keys(state)" :class="['data-el', toDisplayType(type)]">
      <div class="data-type">{{ toDisplayType(type) }}</div>
      <div class="data-fields">
        <template v-if="Array.isArray(state[type])">
          <data-field
            v-for="field in state[type]"
            :key="field.key"
            :field="field"
            :depth="0">
          </data-field>
        </template>
        <template v-else>
          <data-field
            v-for="(value, key) in state[type]"
            :key="key"
            :field="{ value, key }"
            :depth="0">
          </data-field>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import DataField from './DataField.vue'

export default {
  props: ['state'],
  components: {
    DataField
  },
  methods: {
    toDisplayType (type) {
      return type === 'undefined' ? 'data' : type
    }
  }
}
</script>

<style lang="stylus">
.data-wrapper
  display flex
  flex-wrap wrap
  padding-top 20px

.data-fields
  padding 20px 20px 40px

.data-el
  padding 0px 10px
  flex 1 0 33.33%
  font-size 14px

  .data-type
    color #486887
    padding-left 20px
    margin-bottom -10px

    .app.dark &
      color lighten(#486887, 30%)
</style>
