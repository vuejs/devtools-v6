<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  emits: [
    'hide',
  ],

  setup () {
    const step = ref(0)
    const content = ref<HTMLDivElement>()

    watch(step, () => {
      content.value.scrollTop = 0
    })

    return {
      step,
      stepMax: 10,
      content,
    }
  },
})
</script>

<template>
  <div class="bg-white/50 dark:bg-black/50 p-4 flex items-center justify-center">
    <div class="bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 h-full w-[620px] max-w-full flex flex-col">
      <div
        ref="content"
        class="flex-1 overflow-auto p-4"
      >
        <template v-if="step === 0">
          <img
            src="~@front/assets/devtools-logo.svg"
            alt="Devtools logo"
            class="logo max-h-[100px]"
          >
          <h1 class="text-green-500 text-2xl text-center mt-8">
            Welcome to the Vue devtools!
          </h1>
        </template>

        <template v-if="step === 1">
          <h2>Let's take a little tour</h2>

          <p>
            The devtools were entirely rewritten with the release of Vue 3.
          </p>

          <p>
            Its new architecture allows better support of different versions of Vue, as well as integration of third-party libraries (more on that later!).
          </p>

          <p>
            It's packed with changes big and small, so here is an overview of what's new!
          </p>
        </template>

        <template v-if="step === 2">
          <img
            src="~@front/assets/welcome/main-tabs.png"
            alt="Main tabs"
            class="max-h-[120px]"
          >

          <p>
            You might notice that the navigation is different. The devtools now has two main tabs:
          </p>

          <ul>
            <li>the <b>Inspector</b> to display debugging information in a structured way (for example inspecting a component),</li>
            <li>the <b>Timeline</b> to track different kinds of data over time such as events.</li>
          </ul>
        </template>

        <template v-if="step === 3">
          <h2>The Inspector</h2>

          <p>
            Here you can select components and inspect their state.
          </p>

          <img
            src="~@front/assets/welcome/components.png"
            alt="Components inspector"
          >
        </template>

        <template v-if="step === 4">
          <p>
            To access settings, use the new "3 dots" menu in the top right corner.
          </p>

          <img
            src="~@front/assets/welcome/components-menu.png"
            alt="Components menu"
            class="max-h-[270px]"
          >
        </template>

        <template v-if="step === 5">
          <p>
            Any Vue plugin and library can now integrate with the devtools via its <a
              href="https://devtools.vuejs.org/plugin/plugins-guide.html"
              target="_blank"
            >Plugin API</a>.
          </p>

          <p>
            For example, they can add their own custom inspectors:
          </p>

          <img
            src="~@front/assets/welcome/inspector-pinia2.png"
            alt="Pinia inspector"
          >
        </template>

        <template v-if="step === 6">
          <h2>The Timeline</h2>

          <p>
            Here you can see the events coming from your application in real-time. It includes mouse and keyboard events, component events, performance flamecharts...
          </p>

          <img
            src="~@front/assets/welcome/timeline.png"
            alt="Timeline"
          >
        </template>

        <template v-if="step === 7">
          <p>
            You can zoom and pan the timeline, or click on events to see more information.
          </p>

          <img
            src="~@front/assets/welcome/timeline-perf2.png"
            alt="Timeline"
          >
        </template>

        <template v-if="step === 8">
          <p>
            Using the <a
              href="https://devtools.vuejs.org/plugin/plugins-guide.html"
              target="_blank"
            >Devtools Plugin API</a>, third-party libraries can also add layers and events to the Timeline.
          </p>

          <img
            src="~@front/assets/welcome/timeline-pinia.png"
            alt="Timeline pinia"
          >
        </template>

        <template v-if="step === 9">
          <p>
            On the left side of the top bar, you can find a new App Selector. The devtools are now scoped to a specific selected app and can even inspect apps inside iframes!
          </p>

          <img
            src="~@front/assets/welcome/app-selector.png"
            alt="App selector"
            class="max-h-[280px]"
          >
        </template>

        <template v-if="step === 10">
          <img
            src="~@front/assets/devtools-logo.svg"
            alt="Devtools logo"
            class="logo max-h-[100px]"
          >

          <h2 class="text-center mb-8">
            That's it!
          </h2>

          <p>
            We hope that you will enjoy the new Vue devtools.
          </p>

          <p>
            In case something doesn't work with your project, you can use the <a
              href="https://devtools.vuejs.org/guide/installation.html#legacy"
              target="_blank"
            >Legacy version</a> and <a
              href="https://github.com/vuejs/devtools/issues/new/choose"
              target="_blank"
            >report an issue</a>.
          </p>
        </template>
      </div>

      <div class="flex-none flex items-center space-x-4 p-4 relative">
        <div class="absolute top-0 left-0 w-full">
          <div
            class="h-[2px] bg-green-500 transition-all duration-500 ease-out"
            :style="{
              width: `${step / stepMax * 100}%`
            }"
          />
        </div>

        <VueButton
          class="flat"
          @click="$emit('hide')"
        >
          Skip
        </VueButton>
        <div class="flex-1" />
        <VueButton
          :disabled="step === 0"
          @click="step--"
        >
          Previous
        </VueButton>
        <VueButton
          v-if="step < stepMax"
          class="primary w-20"
          @click="step++"
        >
          Next
        </VueButton>
        <VueButton
          v-else
          class="primary w-20"
          @click="$emit('hide')"
        >
          Continue
        </VueButton>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
p {
  @apply my-2;
}

img {
  @apply mx-auto my-4 max-w-full;

  &:first-child {
    @apply mt-0;
  }

  &:not(.logo) {
    @apply border border-gray-200 dark:border-gray-800 rounded-md;
  }
}

li {
  @apply list-disc ml-6;
}

h2 {
  @apply text-green-500 text-lg;
}

a {
  @apply text-green-500;
}
</style>
