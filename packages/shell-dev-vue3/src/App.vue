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
import Functional from './Functional.vue'
import Heavy from './Heavy.vue'
import Mixins from './Mixins.vue'
import Animation from './Animation.vue'
import SetupScript from './SetupScript.vue'
import SetupDataLike from './SetupDataLike.vue'
import SetupTSScriptProps from './SetupTSScriptProps.vue'
import DomOrder from './DomOrder.vue'

import { h, createApp } from 'vue'
import SimplePlugin from './devtools-plugin/simple'

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
    Functional,
    Heavy,
    Mixins,
    Animation,
    SetupScript,
    SetupDataLike,
    SetupTSScriptProps,
    DomOrder,
    inline: {
      render: () => h('h3', 'Inline component definition'),
    },
  },

  data () {
    return {
      count: 0,
      text: 'Meow',
      time: 0,
    }
  },

  methods: {
    createApp () {
      const app = createApp(Child)
      app.use(SimplePlugin)
      app.mount('#nested-app')
    },

    startTimer () {
      this.stopTimer()
      this.timer = setInterval(() => {
        this.time++
      }, 1)
    },

    stopTimer () {
      clearInterval(this.timer)
    },

    onFoo (...args) {
      console.log('on foo', ...args)
    },

    onBar (...args) {
      console.log('on bar', ...args)
    },
  },
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
    <button @click="startTimer">
      Start timer
    </button>
    <button @click="stopTimer">
      Stop timer
    </button>
    <span>{{ time }}</span>
  </div>

  <div>
    <Heavy
      v-for="i in count"
      :key="i"
    />
  </div>

  <Child question="Life" />
  <NestedMore />
  <NativeTypes ref="nativeTypes" />
  <EventEmit
    @foo="onFoo"
    @bar="onBar"
  />
  <EventNesting />
  <AsyncComponent />
  <SuspenseExample />
  <Provide />
  <Animation />
  <Condition />
  <VModelExample />
  <Ghost />
  <Other />
  <SetupRender />
  <Form />
  <Functional msg="I am functional" />
  <Mixins />
  <SetupScript />
  <SetupDataLike />
  <SetupTSScriptProps my-prop="42" />
  <DomOrder />
  <inline />
  <global />

  <h2>Store</h2>
  <div>
    {{ $store.getters.answer }}
    <button @click="$store.commit('increment')">
      +1
    </button>
    {{ $store.getters.twoFoo }}
  </div>

  <button @click="createApp()">
    Create nested app
  </button>
  <div id="nested-app" />

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
