export default {
  StateInspector: {
    dataType: {
      tooltip: '[{{keys.ctrl}}] + |mouse|: Collapse All<br>[{{keys.shift}}] + |mouse|: Expand All'
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
  },
  ComponentTree: {
    select: {
      tooltip: '[S] Select component in the page'
    },
    filter: {
      tooltip: '[F] Filter components by name'
    }
  },
  EventsHistory: {
    filter: {
      tooltip: '[F] To filter on components, type <span class="input-example"><i class="material-icons">search</i> &lt;MyComponent&gt;</span> or just <span class="input-example"><i class="material-icons">search</i> &lt;mycomp</span>.'
    }
  },
  VuexHistory: {
    filter: {
      tooltip: '[F] Filter mutations'
    }
  }
}
