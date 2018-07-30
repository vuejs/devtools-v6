import { suite } from '../utils/suite'

suite('vuex tab', () => {
  it('should display mutations history', () => {
    cy.get('#target').iframe().then(({ get }) => {
      get('.increment')
        .click({ force: true })
        .click({ force: true })
      get('.decrement').click({ force: true })
      get('#counter p').contains('1')
    })
    cy.get('.vuex-tab').click()
    cy.get('.history .entry').should('have.length', 4)
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('type:"DECREMENT"')
      expect(el.text()).to.include('count:1')
    })
    cy.get('.history .entry:nth-child(4)').should('have.class', 'inspected').should('have.class', 'active')
  })

  it('should filter state & getters', () => {
    cy.get('.right .search input').clear().type('cou')
    cy.get('.data-field').should('have.length', 1)
    cy.get('.right .search input').clear().type('no value')
    cy.get('.data-field').should('have.length', 0)
    cy.get('.right .search input').clear()
  })

  it('should filter history', () => {
    cy.get('.left .search input').clear().type('inc')
    cy.get('.history .entry').should('have.length', 3)
    cy.get('.history .entry.inspected').should('have.length', 1)
    cy.get('.history .entry.active').should('have.length', 0)

    cy.get('.left .search input').clear().type('/dec/i')
    cy.get('.history .entry').should('have.length', 2)
    cy.get('.history .entry.inspected').should('have.length', 1)
    cy.get('.history .entry.active').should('have.length', 0)

    cy.get('.left .search input').clear().type('/dec)/i')
    cy.get('.history .entry').should('have.length', 4)
    cy.get('.history .entry.inspected').should('have.length', 1)
    cy.get('.history .entry.active').should('have.length', 1)

    cy.get('.left .search input').clear()
  })

  it('should inspect state', () => {
    cy.get('.history .entry:nth-child(3) .mutation-type').click()
    cy.get('.history .entry:nth-child(3)')
      .should('have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('type:"INCREMENT"')
      expect(el.text()).to.include('count:2')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('1')
    })
  })

  it('should time-travel', () => {
    cy.get('.history .entry:nth-child(3) .entry-actions .action:nth-child(3)').click({ force: true })
    cy.get('.history .entry:nth-child(3)')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })

    cy.get('.history .entry:nth-child(2) .mutation-type').click({ force: true })
    cy.get('.history .entry:nth-child(2)')
      .should('have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('.history .entry:nth-child(3)')
      .should('not.have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('type:"INCREMENT"')
      expect(el.text()).to.include('count:1')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })
    cy.get('.history .entry:nth-child(2) .entry-actions .action:nth-child(3)').click({ force: true })
    cy.get('.history .entry:nth-child(2)')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.history .entry:nth-child(3)')
      .should('not.have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('1')
    })

    // Base state
    cy.get('.history .entry:nth-child(1) .mutation-type').click({ force: true })
    cy.get('.history .entry:nth-child(1)')
      .should('have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:0')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('1')
    })
    cy.get('.history .entry:nth-child(1) .entry-actions .action:nth-child(1)').click({ force: true })
    cy.get('.history .entry:nth-child(1)')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })
  })

  it('should revert', () => {
    cy.get('.history .entry:nth-child(4) .mutation-type').click({ force: true })
    cy.get('.history .entry:nth-child(4) .action:nth-child(2)').click({ force: true })
    cy.get('.history .entry').should('have.length', 3)
    cy.get('.history .entry:nth-child(3)')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:2')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })
  })

  it('should commit', () => {
    cy.get('.history .entry:nth-child(3) .mutation-type').click({ force: true })
    cy.get('.history .entry:nth-child(3) .action:nth-child(1)').click({ force: true })
    cy.get('.history .entry').should('have.length', 1)
    cy.get('.history .entry:nth-child(1)')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:2')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })
  })

  it('should display getters', () => {
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('isPositive:true')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('.decrement')
        .click({ force: true })
        .click({ force: true })
        .click({ force: true })
    })
    cy.get('.history .entry:nth-child(4)').click({ force: true })
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('isPositive:false')
    })
  })

  it('should toggle recording', () => {
    cy.get('.toggle-recording')
      .click()
      .contains('Paused')
    cy.get('.toggle-recording .svg-icon').should('not.have.class', 'enabled')
    // should not record
    cy.get('#target').iframe().then(({ get }) => {
      get('.increment').click({ force: true })
    })
    cy.get('.history .entry').should('have.length', 4)
  })

  it('should copy vuex state', () => {
    cy.get('.export').click()
    cy.get('.export .message')
      .contains('(Copied to clipboard!)')
      .should('not.be.visible', { timeout: 3000 })
  })

  it('should import vuex state', () => {
    cy.get('.import').click()
    cy.get('.import-state').should('be.visible')
    cy.get('.import-state textarea').clear().type('{{}invalid: json}')
    cy.get('.message.invalid-json').should('be.visible')
    cy.get('.import-state textarea').clear().type('{{}"count":42,"date":"[native Date Fri Dec 22 2017 10:12:04 GMT+0100 (CET)]"}')
    cy.wait(500)
    cy.get('.message.invalid-json').should('not.be.visible')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:42')
      expect(el.text()).to.include('date:' + new Date('Fri Dec 22 2017 10:12:04 GMT+0100 (CET)'))
    })
    cy.get('.import').click()
    cy.get('.import-state').should('not.be.visible')
  })
})
