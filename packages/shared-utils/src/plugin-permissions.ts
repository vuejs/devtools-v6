import SharedData from './shared-data'

export enum PluginPermission {
  ENABLED = 'enabled',
  COMPONENTS = 'components',
  CUSTOM_INSPECTOR = 'custom-inspector',
  TIMELINE = 'timeline'
}

export function hasPluginPermission (pluginId: string, permission: PluginPermission) {
  const result = SharedData.pluginPermissions[`${pluginId}:${permission}`]
  if (result == null) return true
  return !!result
}

export function setPluginPermission (pluginId: string, permission: PluginPermission, active: boolean) {
  SharedData.pluginPermissions = {
    ...SharedData.pluginPermissions,
    [`${pluginId}:${permission}`]: active
  }
}
