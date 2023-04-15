import {
  UNDEFINED,
  SPECIAL_TOKENS,
  parse,
} from '@vue-devtools/shared-utils'

let currentEditedField = null

function numberQuickEditMod (event) {
  let mod = 1
  if (event.ctrlKey || event.metaKey) {
    mod *= 5
  }
  if (event.shiftKey) {
    mod *= 10
  }
  if (event.altKey) {
    mod *= 100
  }
  return mod
}

export default {
  inject: {
    InspectorInjection: {
      default: null,
    },
  },

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    removable: {
      type: Boolean,
      default: false,
    },
    renamable: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      editing: false,
      editedValue: null,
      editedKey: null,
      addingValue: false,
      newField: null,
    }
  },

  computed: {
    cssClass () {
      return {
        editing: this.editing,
      }
    },

    isEditable () {
      if (this.InspectorInjection && !this.InspectorInjection.editable) return false
      return this.editable &&
        !this.fieldOptions.abstract &&
        !this.fieldOptions.readOnly &&
        (
          typeof this.field.key !== 'string' ||
          this.field.key.charAt(0) !== '$'
        )
    },

    isValueEditable () {
      const type = this.interpretedValueType
      const customType = this.field.value?._custom?.type

      return this.isEditable &&
        (
          type === 'null' ||
          type === 'literal' ||
          type === 'string' ||
          type === 'array' ||
          type === 'plain-object' ||
          customType === 'bigint'
        )
    },

    isSubfieldsEditable () {
      return this.isEditable && (this.interpretedValueType === 'array' || this.interpretedValueType === 'plain-object')
    },

    valueValid () {
      try {
        parse(this.transformSpecialTokens(this.editedValue, false))
        return true
      } catch (e) {
        return false
      }
    },

    duplicateKey () {
      return this.parentField && this.parentField.value.hasOwnProperty(this.editedKey)
    },

    keyValid () {
      return this.editedKey && (this.editedKey === this.field.key || !this.duplicateKey)
    },

    editValid () {
      return this.valueValid && (!this.renamable || this.keyValid)
    },

    quickEdits () {
      if (this.isValueEditable) {
        const value = this.field.value
        const type = typeof value
        if (type === 'boolean') {
          return [
            {
              icon: value ? 'check_box' : 'check_box_outline_blank',
              newValue: !value,
            },
          ]
        } else if (type === 'number') {
          return [
            {
              icon: 'remove',
              class: 'big',
              title: this.quickEditNumberTooltip('-'),
              newValue: event => value - numberQuickEditMod(event),
            },
            {
              icon: 'add',
              class: 'big',
              title: this.quickEditNumberTooltip('+'),
              newValue: event => value + numberQuickEditMod(event),
            },
          ]
        }
      }
      return null
    },
  },

  methods: {
    openEdit (focusKey = false) {
      if (this.isValueEditable) {
        if (currentEditedField && currentEditedField !== this) {
          currentEditedField.cancelEdit()
        }
        let valueToEdit = this.field.value
        // Edit custom value (we don't want to edit the whole custom value data object)
        if (this.valueType === 'custom') {
          valueToEdit = valueToEdit._custom.value
        }
        this.editedValue = this.transformSpecialTokens(JSON.stringify(valueToEdit), true)
        this.editedKey = this.field.key
        this.editing = true
        currentEditedField = this
        this.$nextTick(() => {
          const el = this.$refs[focusKey && this.renamable ? 'keyInput' : 'editInput']
          el.focus()
          el.setSelectionRange(0, el.value.length)
        })
      }
    },

    cancelEdit () {
      this.editing = false
      this.$emit('cancel-edit')
      currentEditedField = null
    },

    submitEdit () {
      if (this.editValid) {
        this.editing = false
        let value = this.transformSpecialTokens(this.editedValue, false)
        // We need to send the entire custom value data object
        if (this.valueType === 'custom') {
          value = JSON.stringify({
            _custom: {
              ...this.field.value._custom,
              value: JSON.parse(value), // Input
            },
          })
        }
        const newKey = this.editedKey !== this.field.key ? this.editedKey : undefined
        this.sendEdit({ value, newKey })
        this.$emit('submit-edit')
      }
    },

    sendEdit (payload) {
      this.$emit('edit-state', this.path, payload)
    },

    transformSpecialTokens (str, display) {
      if (str) {
        Object.keys(SPECIAL_TOKENS).forEach(key => {
          const value = JSON.stringify(SPECIAL_TOKENS[key])
          let search
          let replace
          if (display) {
            search = value
            replace = key
          } else {
            search = key
            replace = value
          }
          str = str.replace(new RegExp(search, 'g'), replace)
        })
      }
      return str
    },

    quickEdit (info, event) {
      let newValue
      if (typeof info.newValue === 'function') {
        newValue = info.newValue(event)
      } else {
        newValue = info.newValue
      }
      this.sendEdit({ value: JSON.stringify(newValue) })
    },

    removeField () {
      this.sendEdit({ remove: true })
    },

    addNewValue () {
      let key
      if (this.interpretedValueType === 'array') {
        key = this.field.value.length
      } else if (this.interpretedValueType === 'plain-object') {
        let i = 1
        while (this.field.value.hasOwnProperty(key = `prop${i}`)) i++
      }
      this.newField = { key, value: UNDEFINED }
      this.expanded = true
      this.addingValue = true
      this.$nextTick(() => {
        this.$refs.newField.openEdit(true)
      })
    },

    containsEdition () {
      return currentEditedField && currentEditedField.path.indexOf(this.path) === 0
    },

    cancelCurrentEdition () {
      this.containsEdition() && currentEditedField.cancelEdit()
    },

    quickEditNumberTooltip (operator) {
      return this.$t('DataField.quickEdit.number.tooltip', {
        operator,
      })
    },
  },
}
