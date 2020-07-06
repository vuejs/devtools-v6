<script>
import { watch, computed } from '@vue/composition-api'
import { useRouter } from '@front/util/router'
import { useApps } from '../apps'
import AppHeaderSelect from './AppHeaderSelect.vue'
import { useOrientation } from '../layout/orientation'

export default {
  components: {
    AppHeaderSelect
  },

  setup () {
    const router = useRouter()

    const {
      apps,
      currentAppId,
      currentApp,
      selectApp
    } = useApps()

    watch(apps, () => {
      if (!currentApp.value && apps.value.length && currentAppId.value !== apps.value[0].id) {
        router.push({
          params: {
            appId: apps.value[0].id
          }
        })
      }
    })

    const { orientation } = useOrientation()

    return {
      currentApp,
      apps,
      selectApp,
      orientation
    }
  }
}
</script>

<template>
  <AppHeaderSelect
    :items="apps"
    :selected-item="currentApp"
    option-icon="layers"
    @select="app => selectApp(app.id)"
  >
    <template #trigger>
      <VueButton
        class="flat"
        icon-left="layers"
        :icon-right="orientation === 'landscape' ? 'arrow_drop_down' : null"
        :class="{
          'icon-button': orientation === 'portrait'
        }"
      >
        <template v-if="orientation === 'landscape'">
          <span v-if="currentApp">
            {{ currentApp.name }}
          </span>
          <span
            v-else
            class="opacity-50"
          >
            No app
          </span>
        </template>
      </VueButton>
    </template>

    <template #default="{ item: app }">
      <div class="app-button flex items-center">
        <span class="truncate flex-1">{{ app.name }}</span>
        <span class="opacity-50 flex-none flex items-center">
          <img
            src="~@front/assets/vue-logo.svg"
            class="w-6 h-6 mr-2"
            alt="Vue"
          >
          {{ app.version }}
        </span>
      </div>
    </template>
  </AppHeaderSelect>
</template>

<style lang="postcss" scoped>
.app-button {
  width: 220px;
}
</style>
