export {}

describe('Sign up form', () => {
  it('should redirect to the home page after a valid submition', () => {
    cy.visit('http://localhost:3000/signup')

    cy.get('input[type="email"]').type('bob@bob.bob')
    cy.get('#password').type('bobby hammer')
    cy.get('#confirm_password').type('bobby hammer')
    cy.get('input[type="submit"]').click()

    cy.url().should('eq', 'http://localhost:3000/')
  })
})
