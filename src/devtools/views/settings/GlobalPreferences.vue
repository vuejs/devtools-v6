<template>
  <div class="global-preferences preferences">
    <VueFormField title="Normalize component names">
      <VueGroup
        :value="$shared.classifyComponents"
        class="extend"
        @input="$shared.classifyComponents = $event"
      >
        <VueGroupButton
          :value="false"
          label="Original name"
        />
        <VueGroupButton
          :value="true"
          label="Pascal case"
        />
      </VueGroup>
    </VueFormField>

    <VueFormField title="Theme">
      <VueGroup
        :value="$shared.theme"
        class="extend"
        @input="$shared.theme = $event"
      >
        <VueGroupButton
          value="auto"
          label="Auto"
        />
        <VueGroupButton
          value="light"
          label="Light"
        />
        <VueGroupButton
          value="dark"
          label="Dark"
        />
      </VueGroup>
    </VueFormField>

    <VueFormField title="Display density">
      <VueGroup
        :value="$shared.displayDensity"
        class="extend"
        @input="$shared.displayDensity = $event"
      >
        <VueGroupButton
          value="auto"
          label="Auto"
        />
        <VueGroupButton
          value="low"
          label="Low"
        />
        <VueGroupButton
          value="high"
          label="High"
        />
      </VueGroup>
    </VueFormField>

    <VueFormField title="Editable props">
      <VueSwitch
        :value="$shared.editableProps"
        @input="$shared.editableProps = $event"
      >
        Enable <span class="dim">(may print warnings)</span>
      </VueSwitch>
    </VueFormField>

    <VueFormField title="Detected Vue message">
      <VueSwitch
        :value="$shared.logDetected"
        @input="$shared.logDetected = $event"
      >
        Display in browser console
      </VueSwitch>
    </VueFormField>
  </div>
</template>

<style lang="stylus" scoped>
.dim
  color $darkerGrey
</style>
