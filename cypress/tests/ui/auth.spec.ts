import { register } from '../../support/functions'

const username = Cypress.env('googleUsername')
const password = Cypress.env('googlePassword')
const cookieName = Cypress.env('cookieName')
const loginUrl = Cypress.env('loginUrl')

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

  context('Register, sign in and sign out', () => {
    it('with Google', () => {
      cy.task('GoogleSocialLogin', {
        username,
        password,
        loginUrl,
        loginSelector: 'button',
        postLoginSelector: '[data-cy="profile"]',
        headless: true,
      }).then(({ cookies }: any) => {
        const cookie = cookies.filter(
          (cookie: any) => cookie.name === cookieName
        )[0]
        if (cookie) {
          cy.setCookie(cookieName, cookie.value, {
            domain: cookie.domain,
            expiry: cookie.expiry,
            httpOnly: cookie.httpOnly,
            path: cookie.path,
            secure: cookie.secure,
          })
        }
      })

      cy.visit('/profile')
      cy.contains(username).should('exist')

      cy.contains('Sign out').click()

      cy.get('[data-cy="signin"]').should('exist')
      cy.contains('Sign out').should('not.exist')
    })

    it("with it's credentials", function () {
      register({
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
      })

      cy.visit('/auth/signIn')

      cy.get('#email').type(this.user.email)
      cy.get('#password').type(this.user.password)
      cy.get('[type="submit"]').click()

      cy.contains(this.user.email).should('exist')

      cy.contains('Sign out').click()

      cy.get('[data-cy="signin"]').should('exist')
      cy.contains('Sign out').should('not.exist')
    })
  })
})

export {}
