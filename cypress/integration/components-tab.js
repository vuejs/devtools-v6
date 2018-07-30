import { suite } from '../utils/suite'

const baseInstanceCount = 8

suite('components tab', () => {
  it('should detect instances inside shadow DOM', () => {
    cy.get('.tree > .instance:last-child').contains('Shadow')
  })

  it('should select instance', () => {
    cy.get('.instance .self').eq(0).click().then(el => {
      expect(el).to.have.class('selected')
    })
    cy.get('.tree').should('be.visible')
    cy.get('.action-header .title').contains('Root')
    cy.get('.data-field').contains('$route')
  })

  it('should expand root by default', () => {
    cy.get('.instance').should('have.length', baseInstanceCount)
  })

  it('should select child instance', () => {
    cy.get('.instance .instance:nth-child(1) .self').eq(0).click()
    cy.get('.action-header .title').contains('Counter')
    cy.get('.data-el.vuex-bindings .data-field').contains('count:0')
    cy.get('.data-el.computed .data-field').contains('test:1')
    cy.get('.data-el.firebase-bindings .data-field').contains('hello:undefined')
  })

  it('should display prop of different types', () => {
    cy.get('.instance .instance:nth-child(2) .self').eq(0).click()
    cy.get('.action-header .title').contains('Target')
    cy.get('.data-el.props .data-field:nth-child(1)').contains('ins:Object')
    cy.get('.data-el.props .data-field:nth-child(2)').contains('msg:"hi"')
    cy.get('.data-el.props .data-field:nth-child(3)').contains('obj:undefined')
    // Regexp
    cy.get('.data-el.data .data-field:nth-child(8)').then(el => {
      expect(el.text()).to.include('regex:/(a\\w+b)/g')
    })
    // Literals
    cy.get('.data-el.data .data-field:nth-child(5)').contains('NaN')
    cy.get('.data-el.data .data-field:nth-child(2)').contains('Infinity')
    cy.get('.data-el.data .data-field:nth-child(6)').contains('-Infinity')

    // Classify names
    cy.get('.instance .instance:nth-child(3)').contains('OtherWithMine')
    cy.get('.button.classify-names').click()
    cy.get('.instance .instance:nth-child(3)').contains('other-with-mine')
    cy.get('.button.classify-names').click()
    cy.get('.instance .instance:nth-child(3)').contains('OtherWithMine')
  })

  it('should expand child instance', () => {
    cy.get('.instance .instance:nth-child(2) .arrow-wrapper').click()
    cy.get('.instance').should('have.length', baseInstanceCount + 2)
  })

  it('should add/remove component from app side', () => {
    cy.get('#target').iframe().then(({ get }) => {
      get('.add').click({ force: true })
    })
    cy.get('.instance').should('have.length', baseInstanceCount + 5)
    cy.get('#target').iframe().then(({ get }) => {
      get('.remove').click({ force: true })
    })
    cy.get('.instance').should('have.length', baseInstanceCount + 4)
  })

  it('should filter components', () => {
    cy.get('.left .search input').clear().type('counter')
    cy.get('.instance').should('have.length', 1)
    cy.get('.left .search input').clear().type('target')
    cy.get('.instance').should('have.length', 5)
    cy.get('.left .search input').clear()
  })

  it('should select component', () => {
    cy.get('.select-component').click()
    cy.get('#target').iframe().then(({ get }) => {
      get('.mine').eq(0)
        .trigger('mouseover', { force: true })
        .click({ force: true })
    })
    cy.get('.action-header .title').contains('Mine')
    cy.get('.tree').then(el => {
      expect(el.text()).to.include('<Mine>')
    })
  })

  it('should display render key', () => {
    cy.get('.instance .self .attr-title').contains('key')
    cy.get('.instance .self .attr-value').contains('1')
  })

  it('should display injected props', () => {
    cy.get('.left .search input').clear().type('Mine')
    cy.get('.instance').eq(1).click()
    cy.get('.right .data-wrapper').then(el => {
      expect(el.text()).to.contain('injected')
      expect(el.text()).to.contain('answer:42')
      expect(el.text()).to.contain('foo:"bar"')
      expect(el.text()).to.contain('noop:ƒ noop(a, b, c)')
    })
    cy.get('.left .search input').clear()
  })
})
