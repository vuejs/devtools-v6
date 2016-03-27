<template>
  <div id="target">
    <h1>{{msg}}</h1>
    <button class="add" @click="add">Add</button>
    <button class="remove" @click="rm">Remove</button>
    <input v-model="msg">
    <other v-for="item in items" track-by="$index"></other>
  </div>
</template>

<script>
import Other from './Other.vue'
export default {
  components: { Other },
  props: {
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
