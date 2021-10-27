<script>
import { h } from 'vue'

export default {
  components: {
    Child: {
      name: 'Child',
      render () {
        return h('div', 'Child')
      },
    },
  },
}
</script>

<template>
  <div>
    <Child key="1" />

    <div>
      <Child key="2" />
      <Child key="3" />

      <div>
        <Child key="4" />
        <div>
          <Child key="5" />
        </div>
        <Child key="6" />
      </div>
      <Child key="7" />
    </div>

    <Child key="8" />
    <Child key="9" />
  </div>
</template>
