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
@import "../variables"

.data-wrapper
  padding 10px 0 20px 0
  background darken($white, 10%)

  .app.dark &
    background $slate

  .data-fields
    padding 20px
    background $white
    border-bottom-left-radius 3px
    border-bottom-right-radius 3px

    .app.dark &
      border 1px solid $green
      background transparent

  .data-el
    margin-bottom 10px
    padding 0px 10px
    font-size 14px

    .data-type
      color $white
      background $green
      padding 5px 10px 5px 20px
      border-top-left-radius 3px
      border-top-right-radius 3px
</style>
