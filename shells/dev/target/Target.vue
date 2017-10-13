<template>
  <div id="target">
    <h1>{{localMsg}}</h1>
    <span>Regex: {{regex.toString()}}</span>
    <input @keyup.enter="regex = new RegExp($event.target.value)"/>
    <span>(Press enter to set)</span>
    <br/>
    <button class="add" @click="add">Add</button>
    <button class="remove" @click="rm">Remove</button>
    <input v-model="localMsg">
    <other v-for="item in items" :key="item"></other>
    <extends-other v-for="item in otherItems" :key="item"></extends-other>
    <multiple-extends v-for="item in otherItems" :key="item"></multiple-extends>
  </div>
</template>

<script>
import Other from './Other.vue'
import ExtendsOther from './ExtendsOther.vue'
import MultipleExtends from './MultipleExtends.vue'
import MyClass from './MyClass.js'
export default {
  components: { 
    Other,
    ExtendsOther,
    MultipleExtends,
  },
  props: {
    msg: String,
    obj: null,
    ins: MyClass
  },
  data () {
    return {
      localMsg: this.msg,
      items: [1, 2],
      otherItems: [3, 4],
      regex: /(a\w+b)/g,
      nan: NaN,
      infinity: Infinity
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
