beforeEach(() => cy.task('db:reset'))

const logUser = () => {
  cy.fixture('user').then((user) => {
    cy.intercept('GET', '/api/auth/session', {
      body: {
        user: {
          id: user.id,
          email: user.email,
        },
        expires: '123456789',
      },
    })
  })
}

describe('Page Access Authorization (AuthGuard, needAuth)', () => {
  it('should allow authenticated users to access protected pages', function () {
    logUser()
    cy.visit('/profile')
    cy.contains('Welcome').should('exist')
  })

  it('should not allow unauthenticated users to access protected pages', () => {
    cy.visit('/profile')
    cy.contains('Log in!').should('exist')
  })

  it('should allow authenticated users to access public pages', function () {
    logUser()
    cy.visit('/signup')
    cy.contains('Sign up!').should('exist')
  })

  it('should allow unauthenticated users to access public pages', () => {
    cy.visit('/signup')
    cy.contains('Sign up!').should('exist')
  })
})

export {}
