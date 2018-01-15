export default {
  StateInspector: {
    dataType: {
      tooltip: '[{{keys.ctrl}}] + |mouse|: Collapse All<br>[{{keys.shift}}] + |mouse|: Expand All'
    }
  },
  ComponentTree: {
    select: {
      tooltip: '[S] Select component in the page'
    }
  },
  DataField: {
    edit: {
      cancel: {
        tooltip: '[Esc] Cancel'
      },
      submit: {
        tooltip: '[Enter] Submit change'
      }
    },
    quickEdit: {
      number: {
        tooltip: `Quick Edit<br><br>
        [{{keys.ctrl}}] + |mouse|: {{operator}}5<br>
        [{{keys.shift}}] + |mouse|: {{operator}}10<br>
        [{{keys.alt}}] + |mouse|: {{operator}}100`
      }
    }
  }
}
