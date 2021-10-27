<script>
import DataField from './DataField.vue'

export default {
  components: {
    DataField,
  },

  props: {
    fields: {
      type: [Array, Object],
      required: true,
    },

    forceCollapse: {
      type: String,
      default: null,
    },
  },

  data () {
    return {
      limit: 30,
      fieldErrors: {},
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
    },
  },

  watch: {
    fields () {
      this.fieldErrors = {}
    },
  },

  errorCaptured (err, vm) {
    this.$set(this.fieldErrors, vm.field.key, err.message)
  },

  methods: {
    isStateField (field) {
      return field && field.type === 'state'
    },

    showMore () {
      this.limit += 20
    },
  },
}
</script>

<template>
  <div
    class="data-fields"
  >
    <template v-if="isFieldsArray">
      <template v-for="field in displayedFields">
        <div
          v-if="fieldErrors[field.key]"
          :key="field.key"
          class="flex items-center space-x-2 font-mono ml-3"
        >
          <div>
            <span class="text-purple-700 dark:text-purple-300">{{ field.key }}</span><span>:</span>
          </div>
          <pre
            class="bg-red-500 text-white p-2 rounded text-xs my-0.5"
          >{{ fieldErrors[field.key] }}</pre>
        </div>

        <DataField
          v-else
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
    </template>
    <template v-else>
      <template v-for="(value, key) in displayedFields">
        <div
          v-if="fieldErrors[key]"
          :key="key"
          class="flex items-center space-x-2 font-mono ml-3"
        >
          <div>
            <span class="text-purple-700 dark:text-purple-300">{{ key }}</span><span>:</span>
          </div>
          <pre
            class="bg-red-500 text-white p-2 rounded text-xs my-0.5"
          >{{ fieldErrors[key] }}</pre>
        </div>

        <DataField
          v-else
          :key="key"
          :field="{ value, key }"
          :depth="0"
          :path="key.toString()"
          :editable="false"
          @edit-state="(path, payload) => $emit('edit-state', path, payload)"
        />
      </template>
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
