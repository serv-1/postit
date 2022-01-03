import {
  EMAIL_GOOGLE,
  EMAIL_INVALID,
  EMAIL_UNKNOWN,
  METHOD_NOT_ALLOWED,
  PASSWORD_INVALID,
} from '../../../utils/errors'
import { dbSeedResult } from '../../plugins'

const url = '/api/signIn'

describe('/api/signIn', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.task<dbSeedResult>('db:seed').then((result) => {
      cy.wrap(result.u1Id).as('userId')
    })
    cy.fixture('user').as('user')
  })

  describe('POST', () => {
    const method = 'POST'

    it('422 - Email not registered', function () {
      const body = { email: 'bobdoe@test.com', password: this.user.password }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', EMAIL_UNKNOWN)
      })
    })

    it('422 - Email is linked to a Google account', async function () {
      cy.req({ url, method, body: { email: this.user.email } }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', EMAIL_GOOGLE)
      })
    })

    it('422 - Password invalid', function () {
      const body = { email: this.user.email, password: 'wrong password' }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', PASSWORD_INVALID)
      })
    })

    it('422 - Joi validation error', function () {
      cy.req({ url, method, body: { email: 'not an email' } }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message', EMAIL_INVALID)
      })
    })

    it('200 - Should sign in a user', function () {
      const body = { email: this.user.email, password: this.user.password }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('id', this.userId)
        expect(res.body).to.have.property('name', this.user.name)
        expect(res.body).to.have.property('email', this.user.email)
      })
    })
  })

  it('405 - Method not allowed', function () {
    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.ownProperty('message', METHOD_NOT_ALLOWED)
    })
  })
})
