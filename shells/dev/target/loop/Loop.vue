<template>
  <div class="target box">
    <h2>Components in a loop</h2>
    <p>Component for testing adding components in a loop.</p>
    <div class="actions">
      <button class="add" @click="add">Add</button>
      <button class="remove" @click="rm">Remove</button>
      <div class="added-container">
        <added v-for="item in items" :key="item"></added>
      </div>
    </div>
  </div>
</template>

<script>
import Added from './Added.vue'
export default {
  components: { Added },
  props: {
    ins: Object,
    msg: String,
    obj: null
  },
  data() {
    return {
      items: [1, 2]
    }
  },
  computed: {
    awww () {
      return {
        a: {
          b: {
            c: 123
          }
        }
      }
    }
  },
  methods: {
    add () {
      this.items.push(1, 2, 3)
    },
    rm () {
      this.items.pop()
    }
  }
}
</script>

<style lang="stylus">
.added-container
  height: 80px
  overflow-y: scroll

.added-container::-webkit-scrollbar
  -webkit-appearance: none;
  width: 7px;

.added-container::-webkit-scrollbar-thumb
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .5);
  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, .5);
</style>
