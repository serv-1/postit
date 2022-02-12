import err from '../../../../utils/constants/errors'
import { Ids } from '../../../plugins'
import { IPost } from '../../../../models/Post'
import u1 from '../../../fixtures/user1.json'
import u2 from '../../../fixtures/user2.json'
const post = require('../../../fixtures/posts.json')[0]
import { Image } from '../../../../types/common'

describe('/api/posts/:id', () => {
  it('405 - Method not allowed', function () {
    const url = '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0'

    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  it('422 - Invalid :id', function () {
    cy.req({ url: `/api/posts/ohNooo!` }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('message', err.PARAMS_INVALID)
    })
  })

  describe('GET', () => {
    it('404 - Post not found', () => {
      cy.req({ url: '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0' }).then((res) => {
        expect(res.status).to.eq(404)
        expect(res.body).to.have.property('message', err.POST_NOT_FOUND)
      })
    })

    it('200 - Get the post', function () {
      cy.task('db:reset')
      cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
        cy.req({ url: `/api/posts/${ids.pId}` }).then((res) => {
          expect(res.status).to.eq(200)
          expect(res.body).to.have.property('id', ids.pId)
          expect(res.body).to.have.property('name', post.name)
          expect(res.body).to.have.property('description', post.description)
          expect(res.body).to.have.deep.property('categories', post.categories)
          expect(res.body).to.have.property('price', post.price / 100)
          expect(res.body).to.have.deep.property('images', post.images)
          expect(res.body).to.have.property('userId', ids.u1Id)
        })
      })
    })
  })

  describe('PUT', () => {
    it('403 - Forbidden', function () {
      const url = '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0'

      cy.req({ url, method: 'PUT' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.task('db:reset')
      cy.task('db:seed')

      cy.signIn(u1.email, u1.password)

      const url = '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0'
      const body = { csrfToken: 'very invalid', name: 'Carloman' }

      cy.req({ url, method: 'PUT', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.DATA_INVALID)
      })
    })

    it('422 - Cannot update a post created by another user', function () {
      cy.task('db:reset')
      cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
        cy.signIn(u2.email, u2.password)

        const url = `/api/posts/${ids.pId}`
        const body = { name: 'Elbat' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.PARAMS_INVALID)
        })
      })
    })

    it('422 - Invalid request body', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/posts/${ids.pId}`
        const body = { oh: 'nooo!' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.DATA_INVALID)
        })
      })
    })

    describe('name', () => {
      it('422 - Invalid name', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { name: 1 }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.NAME_INVALID)
          })
        })
      })

      it('200 - Name updated', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { name: 'Tebla' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
            cy.task<IPost>('db:getPostByUserId', ids.u1Id).then((post) => {
              expect(post.name).to.eq('Tebla')
            })
          })
        })
      })
    })

    describe('description', () => {
      it('422 - Invalid description', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { description: 1 }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property(
              'message',
              err.DESCRIPTION_INVALID
            )
          })
        })
      })

      it('200 - Description updated', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { description: 'Breathtaking table' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
            cy.task<IPost>('db:getPostByUserId', ids.u1Id).then((post) => {
              expect(post.description).to.eq('Breathtaking table')
            })
          })
        })
      })
    })

    describe('categories', () => {
      it('422 - Invalid categories', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { categories: 1 }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.CATEGORIES_INVALID)
          })
        })
      })

      it('200 - Categories updated', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { categories: ['furniture'] }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
            cy.task<IPost>('db:getPostByUserId', ids.u1Id).then((post) => {
              expect(post.categories).to.deep.eq(['furniture'])
            })
          })
        })
      })
    })

    describe('price', () => {
      it('422 - Invalid price', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { price: 'yes' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.PRICE_INVALID)
          })
        })
      })

      it('200 - Price updated', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { price: 50 }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
            cy.task<IPost>('db:getPostByUserId', ids.u1Id).then((post) => {
              expect(post.price).to.eq(5000)
            })
          })
        })
      })
    })

    describe('images', () => {
      it('422 - Invalid images', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${ids.pId}`
          const body = { images: 'yes' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.IMAGES_INVALID)
          })
        })
      })

      it('200 - Images updated', function () {
        cy.task('db:reset')

        cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
          cy.signIn(u2.email, u2.password)

          const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
          const body = {
            name: 'Chair',
            description: 'Incredible chair',
            categories: ['furniture'],
            price: 20,
            images: [{ base64, type: 'jpeg' }],
          }

          cy.req({ url: '/api/post', method: 'POST', body, csrfToken: true })

          cy.task<IPost>('db:getPostByUserId', ids.u2Id).then((post) => {
            const images: Image[] = []

            for (let i = 0; i < 5; i++) {
              const base64 = Buffer.from(new Uint8Array(1000000))
              images.push({ base64: base64.toString('base64'), type: 'jpeg' })
            }

            const url = `/api/posts/${post._id}`
            const body = { images }
            const options = { url, method: 'PUT', body, csrfToken: true }

            cy.req(options).then((res) => {
              expect(res.status).to.eq(200)

              cy.task<IPost>('db:getPostByUserId', ids.u2Id).then((post) => {
                expect(post.images).to.have.length(5)
                expect(post.images).to.not.have.members(body.images)
              })
            })
          })

          cy.task('deleteImages')
        })
      })
    })
  })

  describe('DELETE', () => {
    it('403 - Forbidden', function () {
      const url = '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0'

      cy.req({ url, method: 'DELETE' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.signIn(u1.email, u1.password)

      const url = '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0'
      const body = { csrfToken: 'very invalid' }

      cy.req({ url, method: 'DELETE', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.DATA_INVALID)
      })
    })

    it('422 - Cannot delete a post created by another user', function () {
      cy.task('db:reset')
      cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
        cy.signIn(u2.email, u2.password)

        const url = `/api/posts/${ids.pId}`

        cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.PARAMS_INVALID)
        })
      })
    })

    it('200 - Post deleted', function () {
      cy.task('db:reset')
      cy.task<Ids>('db:seed', { posts: true }).then((ids) => {
        cy.signIn(u2.email, u2.password)

        const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
        const body = {
          name: 'Chair',
          description: 'Incredible chair',
          categories: ['furniture'],
          price: 20,
          images: [{ base64, type: 'jpeg' }],
        }

        cy.req({ url: '/api/post', method: 'POST', body, csrfToken: true })

        cy.task<IPost>('db:getPostByUserId', ids.u2Id).then((post) => {
          const url = `/api/posts/${post._id}`

          cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)

            cy.task<null>('db:getPostByUserId', ids.u2Id).then((post) => {
              expect(post).to.eq(null)
            })
          })
        })
      })
    })
  })
})
