import type { Plugin } from 'vue'
import FloatingVue from 'floating-vue'
import VueIcons from './components/icons'
import VueDisable from './components/VueDisable.vue'
import VueButton from './components/VueButton.vue'
import VueDropdown from './components/VueDropdown.vue'
import VueDropdownButton from './components/VueDropdownButton.vue'
import VueFormField from './components/VueFormField.vue'
import VueLoadingIndicator from './components/VueLoadingIndicator.vue'
import VueGroup from './components/VueGroup.vue'
import VueGroupButton from './components/VueGroupButton.vue'
import VueIcon from './components/VueIcon.vue'
import VueInput from './components/VueInput.vue'
import VueLoadingBar from './components/VueLoadingBar.vue'
import VueSwitch from './components/VueSwitch.vue'
import VueSelect from './components/VueSelect.vue'
import VueSelectButton from './components/VueSelectButton.vue'
import VueModal from './components/VueModal.vue'
import 'floating-vue/dist/style.css'

export { generateHtmlIcon } from './components/icons'

const ui: Plugin = {
  install(app) {
    app.use(VueIcons)
    app.component('VueButton', VueButton)
    app.component('VueDisable', VueDisable)
    app.component('VueDropdown', VueDropdown)
    app.component('VueFormField', VueFormField)
    app.component('VueDropdownButton', VueDropdownButton)
    app.component('VueLoadingIndicator', VueLoadingIndicator)
    app.component('VueGroup', VueGroup)
    app.component('VueGroupButton', VueGroupButton)
    app.component('VueIcon', VueIcon)
    app.component('VueInput', VueInput)
    app.component('VueLoadingBar', VueLoadingBar)
    app.component('VueSwitch', VueSwitch)
    app.component('VueSelect', VueSelect)
    app.component('VueSelectButton', VueSelectButton)
    app.component('VueModal', VueModal)

    app.use(FloatingVue, {
      container: 'body',
      instantMove: true,
      themes: {
        tooltip: {
          delay: {
            show: 1000,
            hide: 800,
          },
        },
        dropdown: {
          handleResize: false,
        },
      },
    })
  },
}

export default ui
