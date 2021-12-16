import { EMAIL_USED, METHOD_NOT_ALLOWED } from '../../../utils/errors'
import { register } from '../../support/functions'

describe('/api/users', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  context('POST', () => {
    it('422 - Joi validation error (request body data)', function () {
      cy.request({
        method: 'POST',
        url: '/api/users',
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message')
        expect(res.body).to.have.ownProperty('name')
      })
    })

    it('422 - Joi validation error (request body)', () => {
      cy.request({
        method: 'POST',
        url: '/api/users',
        body: 'not json',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message')
        expect(res.body).to.not.have.ownProperty('name')
      })
    })

    it('422 - Email already used', function () {
      register(this.user)
      cy.request({
        method: 'POST',
        url: '/api/users',
        body: {
          name: this.user.name,
          email: this.user.email,
          password: this.user.password,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message', EMAIL_USED)
        expect(res.body).to.have.ownProperty('name', 'email')
      })
    })

    it('405 - Method not allowed', () => {
      cy.request({
        method: 'GET',
        url: '/api/users',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(405)
        expect(res.body).to.have.ownProperty('message', METHOD_NOT_ALLOWED)
      })
    })
  })
})
