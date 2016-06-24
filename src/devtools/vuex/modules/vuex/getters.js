import CircularJSON from 'circular-json-es6'

export function activeState ({ vuex: { base, history, activeIndex }}) {
  const entry = history[activeIndex]
  const res = {}
  if (entry) {
    res.type = entry.mutation.type
    res.payload = CircularJSON.parse(entry.mutation.payload)
  }
  res.state = CircularJSON.parse(entry ? entry.state : base)
  return res
}
