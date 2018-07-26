// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('vueCheckInit', () => {
  cy.get('.message').should('be.visible').then(el => {
    expect(el.text()).to.include('Ready. Detected Vue')
  })
  cy.get('.instance').eq(0).contains('Root')
})

// Add iframe support until becomes part of the framework
Cypress.Commands.add('iframe', { prevSubject: 'element' }, $iframe => {
  const get = selector => cy.wrap($iframe.contents().find(selector))

  const el = $iframe[0]
  const iframeDoc = el.contentDocument || el.contentWindow.document
  if (iframeDoc.readyState === 'complete') {
    return Cypress.Promise.resolve({ body: $iframe.contents().find('body'), get })
  }
  return new Cypress.Promise(resolve => {
    $iframe.on('load', () => {
      resolve({ body: $iframe.contents().find('body'), get })
    })
  })
})
