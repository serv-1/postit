import err from '../../../../utils/constants/errors'
import u1 from '../../../fixtures/user1.json'
import { IPost, IUser } from '../../../../types/common'

type Post = Omit<IPost, 'userId' | 'id'>
const p1: Post = require('../../../fixtures/posts.json')[0]

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

      cy.task('addUser', u1).then((userId) => {
        cy.req<IUser>({ url: `/api/users/${userId}` }).then((res) => {
          expect(res.status).to.eq(200)
          expect(res.body).to.eql({
            id: userId,
            name: u1.name,
            email: u1.email,
            image: '/static/images/' + u1.image,
            posts: [],
            favPosts: [],
          })
        })

        cy.task<string>('addPost', { ...p1, userId }).then((pId) => {
          const p1Images = p1.images.map((img) => '/static/images/posts/' + img)

          cy.req<IUser>({ url: `/api/users/${userId}` }).then((res) => {
            expect(res.body.posts[0]).to.eql({
              id: pId,
              name: p1.name,
              description: p1.description,
              categories: p1.categories,
              price: p1.price / 100,
              images: p1Images,
            })
          })

          cy.signIn(u1.email, u1.password)

          const body = { action: 'push', favPostId: pId }
          cy.req({ method: 'PUT', url: '/api/user', body, csrfToken: true })

          cy.req<IUser>({ url: `/api/users/${userId}` }).then((res) => {
            expect(res.body.favPosts[0]).to.eql({
              id: pId,
              name: p1.name,
              image: p1Images[0],
            })
          })
        })
      })
    })
  })
})
