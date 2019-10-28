<template>
  <div>
    <div data-test-id="transition">
      <button v-on:click="show = !show">
        Toggle
      </button>
      <transition name="fade">
        <TestComponent v-if="show">hello</TestComponent>
      </transition>
    </div>

    <div data-test-id="transition-list">
      <button v-on:click="++count">Add</button>
      <button v-on:click="--count">Remove</button>
      <transition-group name="list" tag="p">
        <component :is="'TestComponent'" v-for="item in count" v-bind:key="item" class="list-item">
          {{ item }}
        </component>
      </transition-group>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
      count: 5
    }
  },
  components: {
    TestComponent: {
      render(h) {
        return h('div', {}, this.$slots.default)
      }
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
