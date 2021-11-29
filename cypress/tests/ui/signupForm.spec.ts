describe('Sign up form', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
    cy.visit('/signup')
  })

  it('should show server-side technical error if any', function () {
    const errMsg = 'Request go brrr!'

    cy.intercept('/api/users', {
      statusCode: 405,
      body: { message: errMsg },
    })

    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('#confirm_password').type(this.user.password)
    cy.get('form').submit()

    cy.contains(errMsg).should('exist')
  })

  it('should redirect to the home page after a valid submission', async function () {
    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('#confirm_password').type(this.user.password)
    cy.get('form').submit()
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
  })
})

export {}
