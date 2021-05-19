<template>
  <form>
    <FormSection>
      <input
        v-model="inputs.foo"
        type="text"
      >
    </FormSection>
    <input
      v-model="inputs.bar"
      type="text"
    >
  </form>
</template>

<script>
import { reactive } from 'vue'
import FormSection from './FormSection.vue'

export default {
  components: {
    FormSection
  },

  setup () {
    const inputs = reactive({
      foo: '',
      bar: ''
    })

    return { inputs }
  }
}
</script>
