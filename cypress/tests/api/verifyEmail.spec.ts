import {
  EMAIL_INVALID,
  EMAIL_UNKNOWN,
  METHOD_NOT_ALLOWED,
} from '../../../utils/errors'
import { register } from '../../support/functions'

describe('/api/verifyEmail', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  context('POST', () => {
    specify('422 - Email unknown', function () {
      cy.request({
        method: 'POST',
        url: '/api/verifyEmail',
        body: { email: this.user.email },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', EMAIL_UNKNOWN)
      })
    })

    specify('422 - Joi validation error', function () {
      cy.request({
        method: 'POST',
        url: '/api/verifyEmail',
        body: { email: 'not an email' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', EMAIL_INVALID)
      })
    })

    specify('200 - Email verified', function () {
      register(this.user)
      cy.request({
        method: 'POST',
        url: '/api/verifyEmail',
        body: { email: this.user.email },
      }).then((res) => {
        expect(res.status).to.eq(200)
      })
    })
  })

  specify('405 - Method not allowed', () => {
    cy.request({
      method: 'GET',
      url: '/api/verifyEmail',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.ownProperty('message', METHOD_NOT_ALLOWED)
    })
  })
})
