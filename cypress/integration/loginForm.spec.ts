describe('Log in form', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
    cy.visit('http://localhost:3000/')
    cy.get('a[href="/api/auth/login"]').click()
  })

  it('should show an error message when the email is not registered', function () {
    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('form').submit()
    cy.contains('This email is not registered.').should('exist')
  })

  it('should show an error message when the password is invalid', function () {
    cy.request('POST', 'http://localhost:3000/api/users', {
      email: this.user.email,
      password: this.user.password,
    })
    cy.get('#email').type(this.user.email)
    cy.get('#password').type('wrong password')
    cy.get('form').submit()
    cy.contains('This password is invalid.').should('exist')
  })

  it('should redirect to the home page after a valid submission', function () {
    cy.request('POST', 'http://localhost:3000/api/users', {
      email: this.user.email,
      password: this.user.password,
    })
    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('form').submit()
    cy.url().should('eql', 'http://localhost:3000/')
  })
})

export {}
