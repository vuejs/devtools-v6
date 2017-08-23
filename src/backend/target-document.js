let target = document
// XXX test
console.log('INIT IT BOY')

export function setDocumentTarget (newTarget) {
  target = newTarget
}

export function getDocumentTarget () {
  return target
}

let id = 0
const documents = new WeakMap()

function getId (doc) {
  console.log('Getting', doc)
  if (!documents.has(doc)) {
    console.log('Added with', id)
    documents.set(doc, id++)
  }
  console.log(`generated id ${documents.get(doc)}`, doc)
  return documents.get(doc)
}

function packTarget (doc) {
  return {
    doc,
    id: getId(doc)
  }
}

export function getAllTargets () {
  const targets = [packTarget(document)]
  return targets.concat(findTargetsInElement(targets[0]))
}

function findTargetsInElement ({ doc }) {
  const iframes = Array.prototype.map.call(doc.getElementsByTagName('iframe'), i => i.contentDocument).map(packTarget)
  return iframes.concat(...iframes.map(findTargetsInElement))
}
