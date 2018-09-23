<template>
  <div class="global-preferences preferences">
    <VueFormField title="Normalize Component Names">
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

    <VueFormField title="Time Format">
      <VueGroup
        :value="$shared.timeFormat"
        class="extend"
        @input="$shared.timeFormat = $event"
      >
        <VueGroupButton
          value="default"
          label="Default"
        />
        <VueGroupButton
          value="ms"
          label="Include ms"
        />
      </VueGroup>
    </VueFormField>
  </div>
</template>
