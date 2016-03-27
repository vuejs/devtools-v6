<template>
  <div id="target">
    <h1>{{msg}}</h1>
    <button class="add" @click="add">Add</button>
    <button class="remove" @click="rm">Remove</button>
    <button class="reverse" @click="reverse">Reverse</button>
    <input v-model="msg">
    <other v-for="item in items" :id="item.a"></other>
  </div>
</template>

<script>
import Other from './Other.vue'

let items = []
for (let i = 0; i < 1000; i++) {
  items.push({a:i})
}

export default {
  components: { Other },
  props: {
    msg: String,
    obj: null
  },
  data() {
    return {
      items: items
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
      this.items.push({a: this.items.length + 1}, {a: this.items.length + 2}, {a: this.items.length + 3})
    },
    rm () {
      this.items.pop()
    },
    reverse () {
      this.items.reverse()
    }
  }
}
</script>
