import { suite } from '../utils/suite'

suite('events tab', () => {
  it('should display new events counter', () => {
    cy.get('#target').iframe().then(({ get }) => {
      get('.btn-emit-event').click({ force: true })
      get('.btn-emit-event1').click({ force: true })
      get('.btn-emit-event2').click({ force: true })
    })
    cy.get('.events-tab .tag').contains(3)
    cy.get('.events-tab').click()
    cy.get('.events-tab .tag').should('not.be.visible')
  })

  it('should display events', () => {
    cy.get('.history .entry').should('have.length', 3)
  })

  it('should add event', () => {
    cy.get('#target').iframe().then(({ get }) => {
      get('.btn-emit-log-event').click({ force: true })
    })
    cy.get('.history .entry').should('have.length', 4)
  })

  it('should search events', () => {
    cy.get('.left .search input').clear().type('event')
    cy.get('.history .entry[data-active="true"]').should('have.length', 3)
    cy.get('.left .search input').clear().type('<eventchild1>')
    cy.get('.history .entry[data-active="true"]').should('have.length', 1)
    cy.get('.left .search input').clear().type('/^event$/')
    cy.get('.history .entry[data-active="true"]').should('have.length', 1)
    cy.get('.left .search input').clear()
    cy.get('.button.reset').click()
    cy.get('.history .entry[data-active="true"]').should('have.length', 0)
  })
})
