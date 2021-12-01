describe('Log in form', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
    cy.visit('/')
    cy.contains('Log in').click()
  })

  it('should show server-side error if any', function () {
    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('form').submit()
    cy.contains('This email is not registered.').should('exist')
  })

  it('should redirect to the home page after a valid submission', function () {
    cy.request('POST', '/api/users', {
      email: this.user.email,
      password: this.user.password,
    })
    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('form').submit()
    cy.url().should('eql', Cypress.config('baseUrl') + '/')
  })
})

export {}
