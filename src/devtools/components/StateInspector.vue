<template>
  <div class="data-wrapper">
    <div v-for="type in getKeys(state)" :class="['data-el', toDisplayType(type, true)]">
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

const keyOrder = {
  undefined: 1,
  props: 2,
  computed: 3,
  state: 1,
  getters: 2
}

export default {
  props: ['state'],
  components: {
    DataField
  },
  methods: {
    getKeys (state) {
      return Object.keys(state).sort((a, b) => {
        return (
          (keyOrder[a] || (a.charCodeAt(0) + 999)) -
          (keyOrder[b] || (b.charCodeAt(0) + 999))
        )
      })
    },
    toDisplayType (type, asClass) {
      return type === 'undefined'
        ? 'data'
        : asClass
          ? type.replace(/\s/g, '-')
          : type
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
