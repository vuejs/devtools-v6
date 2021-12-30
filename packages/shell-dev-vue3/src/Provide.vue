<template>
  <Inject />
</template>

<script>
import { provide, inject } from 'vue'

const symbolForInject = Symbol('inject')
const symbolForSetup = Symbol('setup')

export default {
  components: {
    Inject: {
      name: 'Inject',
      components: {
        NestedInject: {
          name: 'NestedInject',
          inject: {
            renamed: 'injectedData',
            missing: {
              from: 'missingInjected',
              default: () => ({ answer: 42 }),
            },
          },
          template: '<div>nested inject: {{ renamed }} missing: {{ missing }}</div>',
        },
      },
      inject: ['injectedData', symbolForInject],
      setup () {
        return {
          comingFromSetup: inject('fromSetup'),
          comingFromSymbol: inject(symbolForSetup),
        }
      },
      template: '<div>injected: {{ injectedData }} | {{ comingFromSetup }}<NestedInject /></div>',
    },
  },

  provide () {
    return {
      injectedData: 'bar',
      [symbolForInject]: 'foo',
    }
  },

  setup () {
    provide('fromSetup', 'Setup!!')
    provide(symbolForSetup, 'Symbol from Setup')
  },
}
</script>
