describe('Sign up form', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  it('should redirect to the home page after a valid submition', async function () {
    cy.visit('http://localhost:3000/signup')

    cy.get('input[type="email"]').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('#confirm_password').type(this.user.password)
    cy.get('input[type="submit"]').click()

    cy.url().should('eq', 'http://localhost:3000/')
  })
})

export {}
