import u1 from '../../fixtures/user1.json'

const username = Cypress.env('googleUsername')
const password = Cypress.env('googlePassword')
const cookieName = Cypress.env('sessionCookieName')
const smtpBaseUrl = Cypress.env('smtpBaseUrl')
const smtpToken = Cypress.env('smtpToken')

const cleanInboxUrl = `${smtpBaseUrl}/api/v1/inboxes/1577170/clean?api_token=${smtpToken}`
const getInboxMsgUrl = `${smtpBaseUrl}/api/v1/inboxes/1577170/messages?api_token=${smtpToken}`

describe('User sign in and register', () => {
  it('Sign in with Google and sign out', () => {
    cy.task('GoogleSocialLogin', {
      username,
      password,
      loginUrl: 'http://localhost:3000/auth/sign-in',
      loginSelector: '[data-cy="googleBtn"]',
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

    cy.get('[aria-label="Sign out"]').click()

    cy.get('[data-cy="home"]').should('exist')
    cy.get('[aria-label="Sign out"]').should('not.exist')
  })

  it('Register, send a verification mail with credentials and sign out', function () {
    cy.request('PATCH', cleanInboxUrl)
    cy.task('reset')

    cy.visit('/register')

    cy.get('#name').type(u1.name)
    cy.get('#email').type(u1.email)
    cy.get('#password').type(u1.password)
    cy.get('[type="submit"]').click()

    cy.get('[data-cy="profile"]', { timeout: 10000 }).should('exist')
    cy.contains(u1.email).should('exist')

    cy.get('[aria-label="Sign out"]').click()

    cy.get('[data-cy="home"]').should('exist')
    cy.get('[aria-label="Sign out"]').should('not.exist')

    // verify that a mail has been sent
    cy.request(getInboxMsgUrl).then((res) => {
      expect(res.body).to.have.length(1)
    })
  })

  it('Sign in with credentials and sign out', function () {
    cy.task('reset')
    cy.task('addUser', u1)

    cy.visit('/auth/sign-in')

    cy.get('#email').type(u1.email)
    cy.get('#password').type(u1.password)
    cy.get('[type="submit"]').click()

    cy.get('[data-cy="profile"]').should('exist')
    cy.contains(u1.email).should('exist')

    cy.get('[aria-label="Sign out"]').click()

    cy.get('[data-cy="home"]').should('exist')
    cy.get('[aria-label="Sign out"]').should('not.exist')
  })

  it('Forgot password', function () {
    cy.request('PATCH', cleanInboxUrl)
    cy.task('reset')
    cy.task('addUser', u1)

    cy.visit('/auth/forgot-password')

    cy.get('#email').type(u1.email)

    cy.get('button[type="submit"]').click()

    // redirected to the mail sent confirmation page
    cy.get('[data-cy="mailSent"]', { timeout: 10000 }).should('exist')

    cy.request(getInboxMsgUrl).then((res) => {
      cy.request(
        `${smtpBaseUrl + res.body[0].html_path}?api_token=${smtpToken}`
      ).then((res) => {
        cy.document().invoke('write', res.body)
      })
    })

    // remove target html attribute to stay on the actual tab
    cy.get('a').invoke('removeAttr', 'target').click()

    cy.get('[data-cy="profile"]').should('exist')
    cy.contains(u1.email).should('exist')
  })
})
