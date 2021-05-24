import { target } from '@vue-devtools/shared-utils'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'

export function initOnPageConfig () {
  // User project devtools config
  if (Object.hasOwnProperty.call(target, 'VUE_DEVTOOLS_CONFIG')) {
    const config = target.VUE_DEVTOOLS_CONFIG

    // Open in editor
    if (Object.hasOwnProperty.call(config, 'openInEditorHost')) {
      SharedData.openInEditorHost = config.openInEditorHost
    }
  }
}
