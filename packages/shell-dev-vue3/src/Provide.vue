<template>
  <Inject />
</template>

<script>
import { provide, inject } from 'vue'

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
              default: () => ({ answer: 42 })
            }
          },
          template: '<div>nested inject: {{ renamed }} missing: {{ missing }}</div>'
        }
      },
      inject: ['injectedData'],
      setup () {
        return {
          comingFromSetup: inject('fromSetup')
        }
      },
      template: '<div>injected: {{ injectedData }} | {{ comingFromSetup }}<NestedInject /></div>'
    }
  },

  provide () {
    return {
      injectedData: 'bar'
    }
  },

  setup () {
    provide('fromSetup', 'Setup!!')
  }
}
</script>
