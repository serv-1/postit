import err from '../../../utils/constants/errors'
import u1 from '../../fixtures/user1.json'

const url = '/api/verifyEmail'

describe('/api/verifyEmail', () => {
  describe('POST', () => {
    it('422 - Email unknown', function () {
      cy.task('reset')

      const body = { email: u1.email }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_UNKNOWN)
      })
    })

    it('422 - Invalid request body', function () {
      const body = { email: 'not an email' }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_INVALID)
      })
    })

    it('200 - Email verified', function () {
      cy.task('reset')
      cy.task('seed')

      const body = { email: u1.email }

      cy.req({ url, method: 'POST', body }).then((res) => {
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
