<script lang="ts">
import { defineComponent } from 'vue'
import { SharedData } from '@vue-devtools/shared-utils'

export default defineComponent({
  emits: ['close', 'success'],

  setup(props, { emit }) {
    function requestPermission() {
      chrome.permissions.request({
        permissions: ['activeTab'],
        origins: [
          'http://*/*',
          'https://*/*',
          'file:///*',
        ],
      }, (granted) => {
        if (granted) {
          SharedData.timelineScreenshots = true
          emit('success')
          emit('close')
        }
        else {
          cancel()
        }
      })
    }

    function cancel() {
      SharedData.timelineScreenshots = false
      emit('close')
    }

    return {
      requestPermission,
      cancel,
    }
  },
})
</script>

<template>
  <VueModal
    title="Allow taking screenshots"
    class="small"
    @close="$emit('close')"
  >
    <div class="px-6">
      <p>Taking screenshots requires permission to access the Tabs API which also includes access to other information about your tabs.</p>
      <p>Please note that we will only use this permission to take screenshots of the current tab.</p>
    </div>

    <template #footer>
      <div
        class="actions"
      >
        <VueButton
          class="big"
          @click="cancel()"
        >
          Cancel
        </VueButton>
        <VueButton
          class="primary big"
          @click="requestPermission()"
        >
          Request permission
        </VueButton>
      </div>
    </template>
  </VueModal>
</template>
