<template>
  <div class="target-selector">
    <select v-if="targets.length" @click="refreshTargets" v-model="currentTarget" @change="setTarget">
      <option v-for="target in targets" :value="target.id"
      >({{ target.id }}) {{ target.doc.location.pathname }}</option>
    </select>
    <button @click="currentTarget = null">reset</button>
    <button @click="refreshTargets">refresh</button>
  </div>
</template>

<script>
import {
  getDocumentTarget,
  setDocumentTarget,
  getAllTargets
} from '../../backend/target-document'

export default {
  data () {
    return {
      currentTarget: 0,
      targets: []
    }
  },

  created () {
    // TODO check this works on safari and firefox
    this.refreshTargets()
  },

  methods: {
    refreshTargets () {
      this.targets = getAllTargets()
    },
    setTarget () {
      bridge.send('change-target', this.currentTarget)
    }
  }
}
</script>
