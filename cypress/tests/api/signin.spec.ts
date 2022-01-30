import err from '../../../utils/constants/errors'
import { UsersIds } from '../../plugins'
import user from '../../fixtures/user.json'

const url = '/api/signIn'

describe('/api/signIn', () => {
  describe('POST', () => {
    const method = 'POST'

    it('422 - Email not registered', function () {
      const body = { email: 'bobdoe@test.com', password: user.password }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_UNKNOWN)
      })
    })

    it('422 - Email is linked to a Google account', async function () {
      cy.req({ url, method, body: { email: user.email } }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_GOOGLE)
      })
    })

    it('422 - Password invalid', function () {
      const body = { email: user.email, password: 'wrong password' }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.PASSWORD_INVALID)
      })
    })

    it('422 - Invalid request body', function () {
      cy.req({ url, method, body: { email: 'not an email' } }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message', err.EMAIL_INVALID)
      })
    })

    it('200 - Should sign in a user', function () {
      cy.task('db:reset')
      cy.task<UsersIds>('db:seed').then((result) => {
        cy.wrap(result.uId).as('uId')
      })
      const body = { email: user.email, password: user.password }
      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('id', this.uId)
        expect(res.body).to.have.property('name', user.name)
        expect(res.body).to.have.property('email', user.email)
      })
    })
  })

  it('405 - Method not allowed', function () {
    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.ownProperty('message', err.METHOD_NOT_ALLOWED)
    })
  })
})
