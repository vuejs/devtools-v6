import { isSafari } from '@vue-devtools/shared-utils'

if (isSafari) {
  window.chrome = window.browser
}
