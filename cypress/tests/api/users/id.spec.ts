import err from '../../../../utils/constants/errors'
import { Ids } from '../../../plugins'
import u1 from '../../../fixtures/user1.json'
import { PostModel } from '../../../../models/Post'

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
      cy.task('reset')

      cy.task<Ids>('seed').then((ids) => {
        cy.req({ url: `/api/users/${ids.u1Id}` }).then((res) => {
          const { body, status } = res
          expect(status).to.eq(200)
          expect(body).to.have.property('id', ids.u1Id)
          expect(body).to.have.property('name', 'John Doe')
          expect(body).to.have.property('email', 'johndoe@test.com')
          expect(body).to.have.property('image', '/static/images/default.jpg')
          expect(body).to.have.deep.property('postsIds', [])
        })

        const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
        const body = {
          name: 'Cat',
          description: 'Magnificent cat',
          categories: ['cat'],
          price: 50,
          images: [{ base64, ext: 'jpeg' }],
        }

        cy.signIn(u1.email, u1.password)
        cy.req({ url: '/api/post', method: 'POST', body, csrfToken: true })

        cy.req({ url: `/api/users/${ids.u1Id}` }).then((res) => {
          cy.task<PostModel>('getPostByUserId', ids.u1Id).then((post) => {
            expect(res.body).to.have.deep.property('postsIds', [post._id])
          })
        })
      })
    })
  })
})
