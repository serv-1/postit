import {
  DATA_INVALID,
  EMAIL_GOOGLE,
  EMAIL_UNKNOWN,
  METHOD_NOT_ALLOWED,
  PASSWORD_INVALID,
} from '../../../utils/errors'
import { register } from '../../support/functions'

describe('/api/signIn', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  context('POST', () => {
    it('422 - Email not registered', function () {
      cy.request({
        method: 'POST',
        url: '/api/signIn',
        body: {
          email: this.user.email,
          password: this.user.password,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', EMAIL_UNKNOWN)
      })
    })

    it('422 - Email is linked to a Google account', async function () {
      cy.task('addUserToDb', {
        name: this.user.name,
        email: this.user.email,
      })
      cy.request({
        method: 'POST',
        url: '/api/signIn',
        body: { email: this.user.email },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', EMAIL_GOOGLE)
      })
    })

    it('422 - Password invalid', function () {
      register(this.user)

      cy.request({
        url: '/api/signIn',
        method: 'POST',
        body: {
          email: this.user.email,
          password: 'wrong password',
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', PASSWORD_INVALID)
      })
    })

    it('422 - Joi validation error', () => {
      cy.request({
        method: 'POST',
        url: '/api/signIn',
        body: 'not json',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message', DATA_INVALID)
      })
    })

    it('200 - Should sign in a user', function () {
      register(this.user)

      cy.request({
        method: 'POST',
        url: '/api/signIn',
        body: {
          email: this.user.email,
          password: this.user.password,
        },
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.ownProperty('id')
        expect(res.body).to.have.property('email', this.user.email)
      })
    })

    it('405 - Method not allowed', () => {
      cy.request({
        method: 'GET',
        url: '/api/signIn',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(405)
        expect(res.body).to.have.ownProperty('message', METHOD_NOT_ALLOWED)
      })
    })
  })
})
