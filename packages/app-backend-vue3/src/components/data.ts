import { BackendContext } from '@vue-devtools/app-backend-api'
import { getInstanceName } from './util'
import { camelize } from '@vue-devtools/shared-utils'
import SharedData from '@vue-devtools/shared-utils/lib/shared-data'
import { InspectedComponentData } from '@vue-devtools/app-backend-api/lib/component'

/**
 * Get the detailed information of an inspected instance.
 */
export async function getInstanceDetails (instance: any, ctx: BackendContext): Promise<InspectedComponentData> {
  return {
    id: instance.id,
    name: getInstanceName(instance),
    file: instance.type?.__file,
    state: await getInstanceState(instance)
  }
}

async function getInstanceState (instance) {
  return processProps(instance).concat(
    processState(instance)
  )
}

/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processProps (instance) {
  const propsData = []
  const propDefinitions = instance.type.props

  for (let key in instance.props) {
    const propDefinition = propDefinitions ? propDefinitions[key] : null
    key = camelize(key)
    propsData.push({
      type: 'props',
      key,
      value: instance.props[key],
      meta: propDefinition ? {
        type: propDefinition.type ? getPropType(propDefinition.type) : 'any',
        required: !!propDefinition.required
      } : {
        type: 'invalid'
      },
      editable: SharedData.editableProps
    })
  }
  return propsData
}

const fnTypeRE = /^(?:function|class) (\w+)/
/**
 * Convert prop type constructor to string.
 */
function getPropType (type) {
  const match = type.toString().match(fnTypeRE)
  return typeof type === 'function'
    ? (match && match[1]) || 'any'
    : 'any'
}

/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processState (instance) {
  const type = instance.type
  const props = type.props
  const getters =
    type.vuex &&
    type.vuex.getters
  const computedDefs = type.computed

  const data = {
    ...instance.data,
    ...instance.renderContext
  }

  return Object.keys(data)
    .filter(key => (
      !(props && key in props) &&
      !(getters && key in getters) &&
      !(computedDefs && key in computedDefs)
    ))
    .map(key => ({
      key,
      value: data[key],
      editable: true
    }))
}
