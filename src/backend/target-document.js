let target = document
// XXX test
console.log('INIT IT BOY')

export function setDocumentTarget (newTarget) {
  target = newTarget
}

export function getDocumentTarget () {
  return target
}

export function getAllTargets () {
  const targets = [document]
  return targets.concat(findTargetsInElement(document))
}

function findTargetsInElement (el) {
  const iframes = [...el.getElementsByTagName('iframe')].map(i => i.contentDocument)
  return iframes.concat(...iframes.map(findTargetsInElement))
}
