<template>
  <Inject />
</template>

<script>
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
      template: '<div>injected: {{ injectedData }}<NestedInject /></div>'
    }
  },

  provide () {
    return {
      injectedData: 'bar'
    }
  }
}
</script>
