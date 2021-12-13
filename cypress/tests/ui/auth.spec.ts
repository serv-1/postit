describe('User sign in and register', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  it('should redirect unauthenticated user to the sign in page', () => {
    cy.visit('/profile')
    cy.contains(/loading/i).should('exist')
    cy.location('pathname').should('equal', '/auth/signIn')
  })
})
export {}
