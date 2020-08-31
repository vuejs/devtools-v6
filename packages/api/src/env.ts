export const isBrowser = typeof navigator !== 'undefined'
export const target: any = isBrowser
  ? window
  : typeof global !== 'undefined'
    ? global
    : {}
export const hook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__
