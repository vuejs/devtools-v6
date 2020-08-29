<script>
export default {
  name: 'EventNesting',

  inheritAttrs: false,

  props: {
    level: {
      type: Number,
      default: 0
    }
  }
}
</script>

<template>
  <EventNesting
    v-if="level < 10"
    :level="level + 1"
    @notify="$emit('notify', level)"
  />
  <div v-else>
    <button @click="$emit('notify', level)">
      Notify (level {{ level }})
    </button>
  </div>
</template>
