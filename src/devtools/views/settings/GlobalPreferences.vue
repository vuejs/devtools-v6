<template>
  <div class="global-preferences preferences">
    <VueFormField title="Normalize component names">
      <VueGroup
        v-model="$shared.classifyComponents"
        class="extend"
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
        v-model="$shared.theme"
        class="extend"
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
        v-model="$shared.displayDensity"
        class="extend"
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

    <VueFormField
      title="Editable props"
    >
      <VueSwitch v-model="$shared.editableProps">
        Enable
      </VueSwitch>
      <template #subtitle>
        <VueIcon
          icon="warning"
          class="medium"
        />
        May print warnings in the console
      </template>
    </VueFormField>

    <VueFormField title="Detected Vue message">
      <VueSwitch v-model="$shared.logDetected">
        Display in browser console
      </VueSwitch>
    </VueFormField>

    <VueFormField
      title="Autoload Vuex state"
    >
      <VueSwitch v-model="$shared.vuexAutoload">
        Enable
      </VueSwitch>
      <template #subtitle>
        <VueIcon
          icon="warning"
          class="medium"
        />
        May impact performance or cause crashes
      </template>
    </VueFormField>

    <VueFormField
      title="Vuex Legacy"
    >
      <VueSwitch v-model="$shared.vuex1">
        Enable compatibility mode
      </VueSwitch>
      <template #subtitle>
        <VueIcon
          icon="warning"
          class="medium"
        />
        If you use Vuex 1.x, enable this option
      </template>
    </VueFormField>
  </div>
</template>
