import { suite } from '../utils/suite'

suite('vuex edit', () => {
  it('should edit state using the decrease button', () => {
    cy.get('.vuex-tab').click()
    cy.get('[data-id="load-vuex-state"]').click()

    // using the decrease button
    cy.get('.state .data-field').eq(0)
      .find('.actions .vue-ui-button').eq(1)
      .click({ force: true })

    cy.get('.vuex-state-inspector').within(() => {
      cy.get('.key').contains('count').parent().contains('-1')
    })

    cy.get('.state .data-field').eq(0)
      .find('.actions .vue-ui-button').eq(1)
      .click({ force: true })

    cy.get('.vuex-state-inspector').within(() => {
      cy.get('.key').contains('count').parent().contains('-2')
    })

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('-2')
    })
  })

  it('should edit state using the increase button', () => {
    // using the increase button
    cy.get('.state .data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(2)
      .click({ force: true })

    cy.get('.vuex-state-inspector').within(() => {
      cy.get('.key').contains('count').parent().contains('-1')
    })

    cy.get('.state .data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(2)
      .click({ force: true })

    cy.get('.vuex-state-inspector').within(() => {
      cy.get('.key').contains('count').parent().contains('0')
    })

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })
  })

  it('should edit state using the edit input', () => {
    // using the edit input
    cy.get('.state .data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(0).click({ force: true })
    cy.get('.edit-input').type('12')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.wait(200)
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('12')
    })

    // change count back to 1
    cy.get('.state .data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(0).click({ force: true })
    cy.get('.edit-input').type('0')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.wait(200)
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })
  })

  it('should edit state nested field', () => {
    // using the decrease button
    cy.get('.data-field > .children > .data-field').eq(4)
      .find('.actions .vue-ui-button').eq(1)
      .click({ force: true })
      .click({ force: true })

    cy.wait(200)
    cy.get('#target').iframe().then(({ get }) => {
      get('#vuex-object pre').contains('-2')
    })

    // using the increase button
    cy.get('.data-field > .children > .data-field').eq(4)
      .find('.actions .vue-ui-button').eq(2)
      .click({ force: true })
      .click({ force: true })

    cy.wait(200)
    cy.get('#target').iframe().then(({ get }) => {
      get('#vuex-object pre').contains('0')
    })

    // using the input
    cy.get('.data-field > .children > .data-field').eq(4)
      .find('.actions .vue-ui-button').eq(0).click({ force: true })
    cy.get('.edit-input').eq(1).type('12')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.wait(200)
    cy.get('#target').iframe().then(({ get }) => {
      get('#vuex-object pre').contains('12')
    })
  })
})
