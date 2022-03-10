<script>
import { h } from 'vue'

const Functional = (props, context) => {
  return h('div', context.attrs, props.msg)
}
Functional.props = {
  msg: {
    type: String,
  },
}

export default Functional
</script>
