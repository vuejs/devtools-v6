<template>
  <div>
    <section v-if="activeEvent" class="top">
      <span class="component-name">
        <span style="color:#ccc">&lt;</span>
        <span>{{ activeEvent.instanceName }}</span>
        <span style="color:#ccc">&gt;</span>
      </span>
    </section>
    <div class="events-state-inspector">
      <div v-if="!hasEventData" class="no-event-data">
        No event data available
      </div>
      <div v-else>
        <data-field
          v-if="isComplex"
          v-for="(value, key) of sortedEventData"
          :field="{ key, value }"
          :depth="0">
        </data-field>
        <div v-if="!isComplex" :class="{ 'literal': eventDataTypeIsLiteral, 'string': !eventDataTypeIsLiteral }">
          <span v-if="!eventDataTypeIsLiteral">"</span>{{ getEventDataString() }}<span v-if="!eventDataTypeIsLiteral">"</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataField from './DataField.vue'
import { mapGetters } from 'vuex'

export default {

  components: {
    DataField
  },
  data () {
    return {
      showStateCopiedMessage: false,
      eventDataAsString: ''
    }
  },
  computed: {
    ...mapGetters([
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
$border-color = #e3e3e3

.inspector, .main
  position absolute
  width 100%
  height 100%

.main
  display flex
  flex-direction column

section:not(:last-child)
  border-bottom 1px solid $border-color

.top
  line-height 30px
  font-size 18px
  color #0062c3
  padding 10px 20px

.component-name
  margin-right 15px

.component-name, .buttons
  display inline-block
  vertical-align middle
  white-space nowrap

.string
  color: #c41a16

.literal
  color: #03c

.events-state-inspector
  padding 15px 20px

.no-event-data
  color: #ccc;
  text-align: center;
  margin-top: 50px;
  line-height: 30px;
</style>
