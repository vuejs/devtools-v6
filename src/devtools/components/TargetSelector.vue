<template>
  <div class="target-selector">
    <select v-if="targets.length" @click="refreshTargets" v-model="currentTarget" @change="setTarget">
      <option v-for="(target, i) in targets" :value="i"
      >{{ target.location.pathname }}</option>
    </select>
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
