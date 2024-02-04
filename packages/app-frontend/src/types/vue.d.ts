import type {
  SharedData,
  keys,
} from '@vue-devtools/shared-utils'

import type {
  Responsive,
} from '@front/plugins/responsive'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (string, values?: Record<string, any>) => string
    $responsive: Responsive
    $shared: typeof SharedData
    $isChrome: boolean
    $isFirefox: boolean
    $isWindows: boolean
    $isMac: boolean
    $isLinux: boolean
    $keys: typeof keys
  }
}
