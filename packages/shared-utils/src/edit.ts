import { EditStatePayload } from '@vue/devtools-api'

export class StateEditor {
  set (object, path, value, cb = null) {
    const sections = Array.isArray(path) ? path : path.split('.')
    while (sections.length > 1) {
      object = object[sections.shift()]
      if (this.isRef(object)) {
        object = this.getRefValue(object)
      }
    }
    const field = sections[0]
    if (cb) {
      cb(object, field, value)
    } else if (this.isRef(object[field])) {
      this.setRefValue(object[field], value)
    } else {
      object[field] = value
    }
  }

  get (object, path) {
    const sections = Array.isArray(path) ? path : path.split('.')
    for (let i = 0; i < sections.length; i++) {
      object = object[sections[i]]
      if (this.isRef(object)) {
        object = this.getRefValue(object)
      }
      if (!object) {
        return undefined
      }
    }
    return object
  }

  has (object, path, parent = false) {
    if (typeof object === 'undefined') {
      return false
    }

    const sections = Array.isArray(path) ? path.slice() : path.split('.')
    const size = !parent ? 1 : 2
    while (object && sections.length > size) {
      object = object[sections.shift()]
      if (this.isRef(object)) {
        object = this.getRefValue(object)
      }
    }
    return object != null && Object.prototype.hasOwnProperty.call(object, sections[0])
  }

  createDefaultSetCallback (state: EditStatePayload) {
    return (obj, field, value) => {
      if (state.remove || state.newKey) {
        if (Array.isArray(obj)) {
          obj.splice(field, 1)
        } else {
          delete obj[field]
        }
      }
      if (!state.remove) {
        const target = obj[state.newKey || field]
        if (this.isRef(target)) {
          this.setRefValue(target, value)
        } else {
          obj[state.newKey || field] = value
        }
      }
    }
  }

  isRef (ref: any): boolean {
    // To implement in subclass
    return false
  }

  setRefValue (ref:any, value: any): void {
    // To implement in subclass
  }

  getRefValue (ref: any): any {
    // To implement in subclass
    return ref
  }
}
