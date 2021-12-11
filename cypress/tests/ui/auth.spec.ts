describe('User sign up and login', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  it('should redirect unauthenticated user to the login page', () => {
    cy.visit('/profile')
    cy.contains(/loading/i).should('exist')
    cy.location('pathname').should('equal', '/auth/login')
  })

  it('should log in and redirect the user to his profile after sign up', function () {
    cy.visit('/signup')

    cy.get('#username').type(this.user.username)
    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('[type="submit"]').click()

    cy.location('pathname').should('equal', '/profile')
    cy.contains(this.user.username).should('exist')
  })

  it('should redirect the user to his profile after log in', function () {
    cy.request('POST', '/api/users', {
      username: this.user.username,
      email: this.user.email,
      password: this.user.password,
    })

    cy.visit('/auth/login')

    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('[type="submit"]').click()

    cy.location('pathname').should('equal', '/profile')
    cy.contains(this.user.username).should('exist')
  })
})
export {}
