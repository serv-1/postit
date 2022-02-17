import err from '../../../../utils/constants/errors'
import { Ids } from '../../../plugins'

describe('/api/users/:id', () => {
  it('405 - Method not allowed', function () {
    const url = '/api/users/f0f0f0f0f0f0f0f0f0f0f0f0'

    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  it('422 - Invalid :id', function () {
    cy.req({ url: `/api/users/ohNooo!` }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('message', err.PARAMS_INVALID)
    })
  })

  describe('GET', () => {
    it('404 - User not found', () => {
      cy.req({ url: `/api/users/f0f0f0f0f0f0f0f0f0f0f0f0` }).then((res) => {
        expect(res.status).to.eq(404)
        expect(res.body).to.have.property('message', err.USER_NOT_FOUND)
      })
    })

    it('200 - Get the user', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.req({ url: `/api/users/${ids.u1Id}` }).then((res) => {
          expect(res.status).to.eq(200)
          expect(res.body).to.have.property('id', ids.u1Id)
          expect(res.body).to.have.property('name', 'John Doe')
          expect(res.body).to.have.property('email', 'johndoe@test.com')
          expect(res.body).to.have.property(
            'image',
            '/static/images/default.jpg'
          )
        })
      })
    })
  })
})
