<script>
export default {
  extends: {
    extends: {
      data () {
        return {
          dataFromExtendsExtends: 'hey'
        }
      },

      computed: {
        computedFromExtendsExtends () {
          return 'extends extends:' + this.dataFromMixinExtends
        }
      },

      inject: {
        meow: {
          from: 'cat',
          default: 'Meow'
        }
      }
    },

    mixins: [
      {
        data () {
          return {
            dataFromExtendsMixin: 'cat'
          }
        },

        computed: {
          computedFromExtendsMixin () {
            return 'extends mixin:' + this.dataFromMixinMixin
          }
        }
      }
    ],

    data () {
      return {
        dataFromExtends: 'meow'
      }
    },

    computed: {
      computedFromExtends () {
        return 'extends:' + this.dataFromExtends
      }
    }
  },
  mixins: [
    {
      extends: {
        data () {
          return {
            dataFromMixinExtends: 'cheese'
          }
        },

        computed: {
          computedFromMixinExtends () {
            return 'mixin extends:' + this.dataFromMixinExtends
          }
        }
      },

      mixins: [
        {
          data () {
            return {
              dataFromMixinMixin: 'waf'
            }
          },

          computed: {
            computedFromMixinMixin () {
              return 'mixin mixin:' + this.dataFromMixinMixin
            }
          }
        }
      ],

      data () {
        return {
          dataFromMixin: '42'
        }
      },

      computed: {
        computedFromMixin () {
          return 'mixin:' + this.dataFromMixin
        }
      }
    }
  ]
}
</script>

<template>
  <input v-model="dataFromExtends">
  {{ computedFromExtends }}
  <input v-model="dataFromMixin">
  {{ computedFromMixin }}
</template>
