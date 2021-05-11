<script>
import DataField from './DataField.vue'

export default {
  components: {
    DataField
  },

  props: {
    fields: {
      type: [Array, Object],
      required: true
    },

    forceCollapse: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      limit: 30
    }
  },

  computed: {
    isFieldsArray () {
      return Array.isArray(this.fields)
    },

    displayedFields () {
      if (this.isFieldsArray) {
        return this.fields.slice(0, this.limit)
      } else {
        return Object.keys(this.fields)
          .slice(0, this.limit)
          .reduce((obj, key) => {
            obj[key] = this.fields[key]
            return obj
          }, {})
      }
    },

    fieldsCount () {
      if (this.isFieldsArray) {
        return this.fields.length
      } else {
        return Object.keys(this.fields).length
      }
    }
  },

  methods: {
    isStateField (field) {
      return field && field.type === 'state'
    },

    showMore () {
      this.limit += 20
    }
  }
}
</script>

<template>
  <div
    class="data-fields"
  >
    <template v-if="isFieldsArray">
      <DataField
        v-for="field in displayedFields"
        :key="field.key"
        :field="field"
        :depth="0"
        :path="field.key"
        :editable="field.editable"
        :force-collapse="forceCollapse"
        :is-state-field="isStateField(field)"
        @edit-state="(path, payload) => $emit('edit-state', path, payload)"
      />
    </template>
    <template v-else>
      <DataField
        v-for="(value, key) in displayedFields"
        :key="key"
        :field="{ value, key }"
        :depth="0"
        :path="key.toString()"
        :editable="false"
        @edit-state="(path, payload) => $emit('edit-state', path, payload)"
      />
    </template>
    <VueButton
      v-if="fieldsCount > limit"
      v-tooltip="'Show more'"
      icon-left="more_horiz"
      class="icon-button flat more"
      @click="showMore()"
    />
  </div>
</template>

<style lang="stylus" scoped>
.more
  width 20px
  height @width
  >>> .vue-ui-icon
    width 16px
    height @width
</style>
