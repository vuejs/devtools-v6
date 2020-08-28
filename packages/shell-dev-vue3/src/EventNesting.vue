<script>
export default {
  name: 'EventNesting',

  props: {
    level: {
      type: Number,
      default: 0
    }
  }
}
</script>

<template>
  <div
    v-if="level < 10"
  >
    <EventNesting
      :level="level + 1"
      @notify="$emit('notify', level)"
    />
  </div>
  <div v-else>
    <button @click="$emit('notify', level)">
      Notify (level {{ level }})
    </button>
  </div>
</template>
