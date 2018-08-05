export function suite (description, tests) {
  describe(description, () => {
    before(() => {
      cy.visit('/')
      cy.vueCheckInit()
    })
    tests()
  })
}
