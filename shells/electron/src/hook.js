import { installHook } from 'src/backend/hook'

if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  installHook(window)
}
