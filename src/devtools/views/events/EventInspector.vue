<template>
  <scroll-pane>
    <action-header v-if="activeEvent" slot="header">
      <span class="component-name">
        <span style="color:#ccc">&lt;</span><span>{{ activeEvent.instanceName }}</span><span style="color:#ccc">&gt;</span>
      </span>
    </action-header>
    <div v-if="!hasEventData" slot="scroll" class="notice">
      <div>No event data available</div>
    </div>
    <div v-if="hasEventData" slot="scroll">
      <div class="data-fields">
        <data-field
          v-if="isComplex"
          v-for="(value, key) of sortedEventData"
          :field="{ key, value }"
          :depth="0">
        </data-field>
      </div>
      <div v-if="!isComplex" :class="{ 'literal': eventDataTypeIsLiteral, 'string': !eventDataTypeIsLiteral }">
        <span v-if="!eventDataTypeIsLiteral">"</span>{{ getEventDataString() }}<span v-if="!eventDataTypeIsLiteral">"</span>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import DataField from 'components/DataField.vue'
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    DataField,
    ScrollPane,
    ActionHeader
  },
  computed: {
    ...mapGetters('events', [
      'activeEvent'
    ]),
    sortedEventData () {
      return this.isComplex ? this.getSortedEventData() : this.activeEvent.eventData
    },
    hasEventData () {
      return this.activeEvent && (this.activeEvent.eventData !== undefined && this.activeEvent.eventData !== '__vue_devtool_undefined__')
    },
    eventDataType () {
      return Object.prototype.toString.call(this.activeEvent.eventData).slice(8, -1)
    },
    eventDataTypeIsLiteral () {
      return this.eventDataType === 'Number' || this.eventDataType === 'Boolean' || this.eventDataType === 'Null'
    },
    isComplex () {
      return this.eventDataType === 'Object' || this.eventDataType === 'Array'
    }
  },
  methods: {
    getEventDataString () {
      if (this.eventDataType === 'Null') {
        return 'NULL'
      }
      return this.activeEvent.eventData
    },
    getSortedEventData () {
      const ordered = {}
      Object.keys(this.activeEvent.eventData).sort().forEach(key => {
        ordered[key] = this.activeEvent.eventData[key]
      })
      return ordered
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common"

section:not(:last-child)
  border-bottom 1px solid $border-color

.string
  color: #c41a16

.literal
  color: #03c

.no-event-data
  color: #ccc;
  text-align: center;
  margin-top: 50px;
  line-height: 30px;
</style>
