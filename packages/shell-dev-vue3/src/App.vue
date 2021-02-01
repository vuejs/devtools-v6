<script>
import Child from './Child.vue'
import NestedMore from './NestedMore.vue'
import NativeTypes from './NativeTypes.vue'
import EventEmit from './EventEmit.vue'
import EventNesting from './EventNesting.vue'
import AsyncComponent from './AsyncComponent.vue'
import SuspenseExample from './SuspenseExample.vue'
import Provide from './Provide.vue'
import Condition from './Condition.vue'
import VModelExample from './VModelExample.vue'

export default {
  name: 'MyApp',

  components: {
    Child,
    NestedMore,
    NativeTypes,
    EventEmit,
    EventNesting,
    AsyncComponent,
    SuspenseExample,
    Provide,
    Condition,
    VModelExample
  }
}
</script>

<template>
  <h1>Hello from Vue 3</h1>
  <Child question="Life" />
  <NestedMore />
  <NativeTypes />
  <EventEmit />
  <EventNesting />
  <AsyncComponent />
  <SuspenseExample />
  <Provide />
  <Condition />
  <VModelExample />

  <nav>
    <router-link to="/p1">
      page 1
    </router-link>
    |
    <router-link to="/p2">
      page 2
    </router-link>
  </nav>
  <router-view />
</template>
