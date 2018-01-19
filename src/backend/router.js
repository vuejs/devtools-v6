export function getCustomRouterDetails (router) {
  return {
    _custom: {
      type: 'router',
      display: 'VueRouter',
      value: {
        options: router.options,
        currentRoute: router.currentRoute
      },
      fields: {
        abstract: true
      }
    }
  }
}
