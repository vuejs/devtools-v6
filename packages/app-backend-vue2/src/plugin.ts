import { DevtoolsApi } from '@vue-devtools/app-backend-api'
import { App, ComponentState, CustomInspectorNode, setupDevtoolsPlugin } from '@vue/devtools-api'
import { isEmptyObject } from '@vue-devtools/shared-utils'

export function setupPlugin (api: DevtoolsApi, app: App) {
  const ROUTER_INSPECTOR_ID = 'vue2-router-inspector'
  const ROUTER_CHANGES_LAYER_ID = 'vue2-router-changes'

  setupDevtoolsPlugin({
    app,
    id: 'org.vuejs.vue2-internal',
    label: 'Vue 2',
    homepage: 'https://vuejs.org/',
    logo: 'https://vuejs.org/images/icons/favicon-96x96.png'
  }, api => {
    // Vue Router
    if (app.$router) {
      const router = app.$router
      console.log('ROUTER', router)

      // Inspector

      api.addInspector({
        id: ROUTER_INSPECTOR_ID,
        label: 'Routes',
        icon: 'book',
        treeFilterPlaceholder: 'Search routes'
      })

      api.on.getInspectorTree(payload => {
        if (payload.app === app && payload.inspectorId === ROUTER_INSPECTOR_ID) {
          payload.rootNodes = router.options.routes.map(route => formatRouteNode(router, route, '', payload.filter)).filter(Boolean)
        }
      })

      api.on.getInspectorState(payload => {
        if (payload.app === app && payload.inspectorId === ROUTER_INSPECTOR_ID) {
          const route = router.matcher.getRoutes().find(r => getPathId(r) === payload.nodeId)
          if (route) {
            payload.state = {
              options: formatRouteData(route)
            }
          }
        }
      })

      // Timeline

      api.addTimelineLayer({
        id: ROUTER_CHANGES_LAYER_ID,
        label: 'Router Navigations',
        color: 0x40a8c4
      })

      router.afterEach((to, from) => {
        api.addTimelineEvent({
          layerId: ROUTER_CHANGES_LAYER_ID,
          event: {
            time: Date.now(),
            title: to.path,
            data: {
              from,
              to
            }
          }
        })
        api.sendInspectorTree(ROUTER_INSPECTOR_ID)
      })
    }
  })
}

/**
 * Extracted from tailwind palette
 */
const BLUE_600 = 0x2563eb
const LIME_500 = 0x84cc16
const CYAN_400 = 0x22d3ee
const ORANGE_400 = 0xfb923c
const DARK = 0x666666

function formatRouteNode (router, route, parentPath: string, filter: string): CustomInspectorNode {
  const node: CustomInspectorNode = {
    id: parentPath + route.path,
    label: route.path,
    children: route.children?.map(child => formatRouteNode(router, child, route.path, filter)).filter(Boolean),
    tags: []
  }

  if (filter && !node.id.includes(filter) && !node.children?.length) return null

  if (route.name != null) {
    node.tags.push({
      label: String(route.name),
      textColor: 0,
      backgroundColor: CYAN_400
    })
  }

  if (route.alias != null) {
    node.tags.push({
      label: 'alias',
      textColor: 0,
      backgroundColor: ORANGE_400
    })
  }

  const currentPath = router.currentRoute.matched.reduce((p, m) => p + m.path, '')
  if (node.id === currentPath) {
    node.tags.push({
      label: 'active',
      textColor: 0xffffff,
      backgroundColor: BLUE_600
    })
  }

  if (route.redirect) {
    node.tags.push({
      label:
        'redirect: ' +
        (typeof route.redirect === 'string' ? route.redirect : 'Object'),
      textColor: 0xffffff,
      backgroundColor: DARK
    })
  }

  return node
}

function formatRouteData (route) {
  const data: Omit<ComponentState, 'type'>[] = []

  data.push({ key: 'path', value: route.path })

  if (route.redirect) {
    data.push({ key: 'redirect', value: route.redirect })
  }

  if (route.alias) {
    data.push({ key: 'alias', value: route.alias })
  }

  if (route.props) {
    data.push({ key: 'props', value: route.props })
  }

  if (route.name && route.name != null) {
    data.push({ key: 'name', value: route.name })
  }

  if (route.component) {
    const component: any = {}
    // if (route.component.__file) {
    //   component.file = route.component.__file
    // }
    if (route.component.template) {
      component.template = route.component.template
    }
    if (route.component.props) {
      component.props = route.component.props
    }
    if (!isEmptyObject(component)) {
      data.push({ key: 'component', value: component })
    }
  }

  return data
}

function getPathId (routeMatcher) {
  let path = routeMatcher.path
  if (routeMatcher.parent) {
    path = getPathId(routeMatcher.parent) + path
  }
  return path
}
