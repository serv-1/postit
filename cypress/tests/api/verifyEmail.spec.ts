import err from '../../../utils/errors'

const url = '/api/verifyEmail'

describe('/api/verifyEmail', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  describe('POST', () => {
    const method = 'POST'

    it('422 - Email unknown', function () {
      const body = { email: this.user.email }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_UNKNOWN)
      })
    })

    it('422 - Joi validation error', function () {
      const body = { email: 'not an email' }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_INVALID)
      })
    })

    it('200 - Email verified', function () {
      cy.task('db:seed')
      const body = { email: this.user.email }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(200)
      })
    })
  })

  it('405 - Method not allowed', function () {
    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })
})
