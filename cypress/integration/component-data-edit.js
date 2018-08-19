import { suite } from '../utils/suite'

suite('component data edit', () => {
  it('should edit data using the decrease button', () => {
    // select Instance
    cy.get('.instance:nth-child(1) .instance:nth-child(2)').eq(0).click()
    cy.get('.data-field').eq(7).find('.actions .vue-ui-button').eq(1).click({force: true}).click({force: true})
    cy.get('.data-field').eq(7).should('contain', '-1')

    // expect DOM element to be updated
    cy.get('#target').iframe().then(({ get }) => {
      get('#target div').eq(0).contains('-1')
    })
  })

  it('should edit data using the increase button', () => {
    cy.get('.instance:nth-child(1) .instance:nth-child(2)').eq(0).click()
    cy.get('.data-field').eq(7).find('.actions .vue-ui-button').eq(2).click({force: true})
    cy.get('.data-field').eq(7).should('contain', '0')

    // expect DOM element to be updated
    cy.get('#target').iframe().then(({ get }) => {
      get('#target div').eq(0).contains('0')
    })
  })

  it('should edit data using the edit input', () => {
    cy.get('.instance:nth-child(1) .instance:nth-child(2)').eq(0).click()
    cy.get('.data-field').eq(7).find('.actions .vue-ui-button').eq(0).click({force: true})

    cy.get('.edit-input').type('12')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('.data-field').eq(7).should('contain', '12')

    // expect DOM element to be updated
    cy.get('#target').iframe().then(({ get }) => {
      get('#target div').eq(0).contains('12')
    })
  })

  it('should add elements to array', () => {
    cy.get('.instance:nth-child(1) .instance:nth-child(2)').eq(0).click()
    cy.get('.data-field').eq(6).find('.actions .vue-ui-button').eq(1).click({force: true})

    cy.get('.edit-input').type('55')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('.data-field').eq(6).find('.children .data-field').should('have.length', '3')
    cy.get('.data-field').eq(6).find('.children .data-field').eq(2).should('contain', 55)

    // expect DOM element to be updated
    cy.get('#target').iframe().then(({ get }) => {
      get('#target div').eq(4).contains('55')
    })
  })

  it('should remove elements from array', () => {
    cy.get('.instance:nth-child(1) .instance:nth-child(2)').eq(0).click()
    cy.get('.data-field').eq(9).find('.actions .vue-ui-button').eq(3).click({force: true})

    cy.get('.data-field').eq(6).find('.children .data-field').should('have.length', '2')
  })

  it('should parse object through edit input', () => {
    cy.get('.instance:nth-child(1) .instance:nth-child(2)').eq(0).click()
    cy.get('.data-field').eq(7).find('.actions .vue-ui-button').eq(0).click({force: true})

    cy.get('.edit-input').type('{{}"count":42}')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('.data-field').eq(7).should('contain', 'Object')
    // expand object
    cy.get('.data-field').eq(7).click()
    cy.get('.data-field').eq(8).find('.key').should('contain', 'count')
    cy.get('.data-field').eq(8).find('.value').should('contain', 42)
  })

  it('should rename object\'s property', () => {
    cy.get('.instance:nth-child(1) .instance:nth-child(2)').eq(0).click()
    cy.get('.data-field').eq(8).find('.actions .vue-ui-button').eq(0).click({force: true})
    cy.get('.edit-input.key-input').clear().type('name')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('.data-field').eq(8).find('.key').should('contain', 'name')
  })
})
