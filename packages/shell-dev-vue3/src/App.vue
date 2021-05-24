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
import Ghost from './Ghost.vue'
import Other from './Other.vue'
import SetupRender from './SetupRender.js'
import Form from './Form.vue'
import Heavy from './Heavy.vue'

import { h } from 'vue'

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
    VModelExample,
    Ghost,
    Other,
    SetupRender,
    Form,
    Heavy,
    inline: {
      render: () => h('h3', 'Inline component definition')
    }
  },

  data () {
    return {
      count: 0,
      text: 'Meow'
    }
  }
}
</script>

<template>
  <h1>Hello from Vue 3</h1>

  <div style="margin-bottom: 12px;">
    {{ count }} <button @click="count++">
      +1
    </button>
    <input v-model="text">
    <span>{{ text }}</span>
  </div>

  <div>
    <Heavy
      v-for="i in count"
      :key="i"
    />
  </div>

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
  <Ghost />
  <Other />
  <SetupRender />
  <Form />
  <inline />
  <global />

  <h2>Store</h2>
  <div>
    {{ $store.getters.answer }}
    {{ $store.getters.twoFoo }}
  </div>

  <nav>
    <router-link to="/p1">
      page 1
    </router-link>
    |
    <router-link to="/p2">
      page 2
    </router-link>
  </nav>

  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
