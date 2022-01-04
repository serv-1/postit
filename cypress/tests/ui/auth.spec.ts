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

  it('Unauthenticated user should be redirected to the sign in page', () => {
    cy.visit('/profile')
    cy.contains(/loading/i).should('exist')
    cy.location('pathname').should('equal', '/auth/sign-in')
  })

  it('Sign in with Google and sign out', () => {
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

    cy.location('pathname').should('equal', '/auth/sign-in')
    cy.contains('Sign out').should('not.exist')
  })

  it('Sign in with credentials and sign out', function () {
    cy.task('db:seed')
    cy.visit('/auth/sign-in')

    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('input[type="submit"]').click()

    cy.location('pathname').should('equal', '/profile')
    cy.contains(this.user.email).should('exist')

    cy.contains('Sign out').click()

    cy.location('pathname').should('equal', '/auth/sign-in')
    cy.contains('Sign out').should('not.exist')
  })

  it('Register, send a verification mail with credentials and sign out', function () {
    cy.visit('/register')

    cy.get('#name').type(this.user.name)
    cy.get('#email').type(this.user.email)
    cy.get('#password').type(this.user.password)
    cy.get('input[type="submit"]').click()

    cy.location('pathname').should('equal', '/profile')
    cy.contains(this.user.email).should('exist')

    cy.contains('Sign out').click()

    cy.location('pathname').should('equal', '/auth/sign-in')
    cy.contains('Sign out').should('not.exist')

    // verify that a mail has been sent
    cy.request(getInboxMsgUrl).then((res) => {
      expect(res.body).to.have.length(1)
    })
  })

  it('Forgot password', function () {
    cy.task('db:seed')
    cy.visit('/auth/forgot-password')

    cy.get('#email').type(this.user.email)
    cy.get('button[type="submit"]').click()

    cy.location('pathname').should('equal', '/auth/email-sent')

    cy.request(getInboxMsgUrl).then((res) => {
      cy.request(
        `${smtpBaseUrl + res.body[0].html_path}?api_token=${smtpToken}`
      ).then((res) => {
        cy.document().invoke('write', res.body)
      })
    })

    // remove target html attribute to stay on the actual tab
    cy.get('a').invoke('removeAttr', 'target')
    cy.get('a').click()

    cy.location('pathname').should('equal', '/profile')
    cy.contains(this.user.email).should('exist')
  })
})

export {}
