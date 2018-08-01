import { suite } from '../utils/suite'

suite('vuex edit', () => {
  it('should edit state', () => {
    cy.get('.vuex-tab').click()
    // using the decrease button
    cy.get('.data-field').eq(0)
      .find('.actions .vue-ui-button').eq(1)
      .click({ force: true })
      .click({ force: true })

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('-2')
    })

    // using the increase button
    cy.get('.data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(2)
      .click({ force: true })
      .click({ force: true })

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })

    // using the edit input
    cy.get('.data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(0).click({ force: true })
    cy.get('.edit-input').type('12')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('12')
    })

    // change count back to 1
    cy.get('.data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(0).click({ force: true })
    cy.get('.edit-input').type('0')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })
  })
})
