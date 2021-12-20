import { register } from '../../support/functions'

const username = Cypress.env('googleUsername')
const password = Cypress.env('googlePassword')
const cookieName = Cypress.env('sessionCookieName')
const smtpBaseUrl = Cypress.env('smtpBaseUrl')
const smtpToken = Cypress.env('smtpToken')

const cleanInboxUrl = `${smtpBaseUrl}/api/v1/inboxes/1577170/clean?api_token=${smtpToken}`
const getInboxMsgUrl = `${smtpBaseUrl}/api/v1/inboxes/1577170/messages?api_token=${smtpToken}`

describe('User sign in and register', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
    cy.request('PATCH', cleanInboxUrl)
  })

  it('should redirect unauthenticated user to the sign in page', () => {
    cy.visit('/profile')
    cy.contains(/loading/i).should('exist')
    cy.location('pathname').should('equal', '/auth/sign-in')
  })

  context('Register, sign in and sign out', () => {
    it('with Google', () => {
      cy.task('GoogleSocialLogin', {
        username,
        password,
        loginUrl: 'http://localhost:3000/auth/sign-in',
        loginSelector: 'button',
        postLoginSelector: '[data-cy="profile"]',
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

      cy.get('[data-cy="sign-in"]').should('exist')
      cy.contains('Sign out').should('not.exist')
    })

    it('with credentials', function () {
      register(this.user)

      cy.visit('/auth/sign-in')

      cy.get('#email').type(this.user.email)
      cy.get('#password').type(this.user.password)
      cy.get('input[type="submit"]').click()

      cy.contains(this.user.email).should('exist')

      cy.contains('Sign out').click()

      cy.get('[data-cy="sign-in"]').should('exist')
      cy.contains('Sign out').should('not.exist')
    })
  })

  specify('Forgot password', function () {
    register(this.user)

    cy.visit('/auth/forgot-password')

    cy.get('#email').type(this.user.email)
    cy.get('input[type="submit"]').click()

    cy.location('pathname').should('equal', '/auth/email-sent')
    cy.get('[data-cy="email-sent"]').should('exist')

    cy.request(getInboxMsgUrl).then((res) => {
      cy.request(
        `${smtpBaseUrl + res.body[0].html_path}?api_token=${smtpToken}`
      ).then((res) => {
        cy.document().invoke('write', res.body)
      })
    })

    cy.get('a').invoke('removeAttr', 'target')
    cy.get('a').click()

    cy.location('pathname').should('equal', '/profile')
    cy.contains(this.user.email).should('exist')
  })
})
