import err from '../../../utils/constants/errors'
import { Ids } from '../../plugins'
import u1 from '../../fixtures/user1.json'

const url = '/api/signIn'

describe('/api/signIn', () => {
  describe('POST', () => {
    it('422 - Email not registered', function () {
      const body = { email: 'bobdoe@test.com', password: u1.password }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_UNKNOWN)
      })
    })

    it('422 - Password invalid', function () {
      const body = { email: u1.email, password: 'wrong password' }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.PASSWORD_INVALID)
      })
    })

    it('422 - Invalid request body', function () {
      const body = { email: 'not an email' }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message', err.EMAIL_INVALID)
      })
    })

    it('200 - Should sign in a user', function () {
      cy.task('reset')

      cy.task<Ids>('seed').then((ids) => {
        const body = { email: u1.email, password: u1.password }

        cy.req({ url, method: 'POST', body }).then((res) => {
          expect(res.status).to.eq(200)
          expect(res.body).to.have.property('id', ids.u1Id)
          expect(res.body).to.have.property('name', u1.name)
          expect(res.body).to.have.property('email', u1.email)
        })
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
