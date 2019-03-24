<template>
  <scroll-pane>
    <action-header
      v-show="hasTarget"
      slot="header"
    >
      <span class="title">
        <span class="title-bracket">&lt;</span>
        <span>{{ targetName }}</span>
        <span class="title-bracket">&gt;</span>
      </span>
      <div class="search">
        <VueIcon icon="search" />
        <input
          v-model.trim="filter"
          placeholder="Filter inspected data"
        >
      </div>
      <VueLoadingIndicator
        v-if="loading"
        class="primary"
      />
      <a
        v-if="$isChrome"
        v-tooltip="'Inspect DOM'"
        class="button inspect"
        @click="inspectDOM"
      >
        <VueIcon icon="code" />
        <span>Inspect DOM</span>
      </a>
      <a
        v-if="fileIsPath"
        v-tooltip="$t('ComponentInspector.openInEditor.tooltip', { file: target.file })"
        class="button"
        @click="openInEditor"
      >
        <VueIcon icon="launch" />
        <span>Open in editor</span>
      </a>
    </action-header>
    <template slot="scroll">
      <section
        v-if="!hasTarget"
        class="notice"
      >
        <div>Select a component instance to inspect.</div>
      </section>
      <div
        v-else-if="!target.state || !target.state.length"
        class="notice"
      >
        <div>This instance has no reactive state.</div>
      </div>
      <section
        v-else
        class="data"
      >
        <state-inspector
          :state="filteredState"
          class="component-state-inspector"
        />
      </section>
    </template>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import StateInspector from 'components/StateInspector.vue'
import { searchDeepInObject, sortByKey, classify, openInEditor } from 'src/util'
import groupBy from 'lodash.groupby'

export default {
  components: {
    ScrollPane,
    ActionHeader,
    StateInspector
  },

  props: {
    target: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      filter: ''
    }
  },

  computed: {
    hasTarget () {
      return this.target.id != null
    },

    targetName () {
      return this.$shared.classifyComponents ? classify(this.target.name) : this.target.name
    },

    filteredState () {
      return groupBy(sortByKey(this.target.state.filter(el => {
        return searchDeepInObject({
          [el.key]: el.value
        }, this.filter)
      })), 'type')
    },

    // Checks if the file is actually a path (e.g. '/path/to/file.vue'), or
    // only the basename of a pre-compiled 3rd-party component (e.g. 'file.vue')
    fileIsPath () {
      return this.target.file && /[/\\]/.test(this.target.file)
    }
  },

  methods: {
    inspectDOM () {
      if (!this.hasTarget) return
      if (this.$isChrome) {
        chrome.devtools.inspectedWindow.eval(
          `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get("${this.target.id}").$el)`
        )
      } else {
        window.alert('DOM inspection is not supported in this shell.')
      }
    },

    openInEditor () {
      const file = this.target.file
      openInEditor(file)
    }
  }
}
</script>

<style lang="stylus" scoped>
.title
  white-space nowrap
  position relative
  top -1px
</style>
