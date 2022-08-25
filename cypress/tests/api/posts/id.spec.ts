import err from '../../../../utils/constants/errors'
import { PostModel } from '../../../../models/Post'
import { UserModel } from '../../../../models/User'
import u1 from '../../../fixtures/user1.json'
import u2 from '../../../fixtures/user2.json'
import { IImage, IPost } from '../../../../types/common'
import { DiscussionModel } from '../../../../models/Discussion'

type Posts = Omit<IPost, 'id' | 'userId'>[]
const [p1, p2]: Posts = require('../../../fixtures/posts.json')

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
      cy.task('reset')

      cy.task<string[]>('addUsers', JSON.stringify([u1, u2])).then(
        ([userId]) => {
          const posts = [
            { ...p1, userId },
            { ...p2, userId },
          ]

          cy.task<string[]>('addPosts', JSON.stringify(posts)).then((pIds) => {
            const discussion = {
              messages: [{ message: 'yo', userId: 'f0f0f0f0f0f0f0f0f0f0f0f0' }],
              postName: 'table',
              postId: pIds[0],
            }

            cy.task<string>('addDiscussion', discussion).then((dId) => {
              cy.req<IPost>({ url: `/api/posts/${pIds[0]}` }).then((res) => {
                const { body, status } = res

                expect(status).to.eq(200)

                const p1Images = p1.images.map(
                  (img) => '/static/images/posts/' + img
                )

                expect(body).to.eql({
                  id: pIds[0],
                  name: p1.name,
                  description: p1.description,
                  categories: p1.categories,
                  price: p1.price / 100,
                  images: p1Images,
                  address: p1.address,
                  latLon: p1.latLon,
                  discussionsIds: [dId],
                  user: {
                    id: userId,
                    name: u1.name,
                    email: u1.email,
                    image: '/static/images/' + u1.image,
                    posts: [
                      {
                        id: pIds[1],
                        name: p2.name,
                        price: p2.price / 100,
                        image: '/static/images/posts/' + p2.images[0],
                        address: p2.address,
                      },
                    ],
                  },
                })
              })
            })
          })
        }
      )
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
      cy.task('reset')
      cy.task('addUser', u1)
      cy.signIn(u1.email, u1.password)

      const url = '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0'
      const body = { csrfToken: 'very invalid', name: 'Carloman' }

      cy.req({ url, method: 'PUT', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })

    it('422 - Cannot update a post created by another user', function () {
      cy.task('reset')

      cy.task<string[]>('addUsers', JSON.stringify([u1, u2])).then(([u1Id]) => {
        const p = { ...p1, userId: u1Id }

        cy.task<string>('addPost', p).then((pId) => {
          cy.signIn(u2.email, u2.password)

          const url = `/api/posts/${pId}`
          const body = { name: 'Elbat' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.PARAMS_INVALID)
          })
        })
      })
    })

    it('422 - Invalid request body', function () {
      cy.task('reset')

      cy.task('addUser', u1).then((userId) => {
        const p = { ...p1, userId }

        cy.task<string>('addPost', p).then((pId) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${pId}`
          const body = { oh: 'nooo!' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.DATA_INVALID)
          })
        })
      })
    })

    describe('name', () => {
      it('422 - Invalid name', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { name: 1 }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(422)
                expect(res.body).to.have.property('message', err.NAME_INVALID)
              }
            )
          })
        })
      })

      it('200 - Name updated', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { name: 'Tebla' }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(200)

                cy.task<PostModel>('getPostByUserId', userId).then((post) => {
                  expect(post.name).to.eq('Tebla')
                })
              }
            )
          })
        })
      })
    })

    describe('description', () => {
      it('422 - Invalid description', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { description: 1 }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(422)
                expect(res.body).to.have.property(
                  'message',
                  err.DESCRIPTION_INVALID
                )
              }
            )
          })
        })
      })

      it('200 - Description updated', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { description: 'Breathtaking table' }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(200)
              }
            )

            cy.task<PostModel>('getPostByUserId', userId).then((post) => {
              expect(post.description).to.eq('Breathtaking table')
            })
          })
        })
      })
    })

    describe('categories', () => {
      it('422 - Invalid categories', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { categories: 1 }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(422)
                expect(res.body).to.have.property(
                  'message',
                  err.CATEGORIES_INVALID
                )
              }
            )
          })
        })
      })
    })

    it('200 - Categories updated', function () {
      cy.task('reset')

      cy.task<string>('addUser', u1).then((userId) => {
        const p = { ...p1, userId }

        cy.task<string>('addPost', p).then((pId) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${pId}`
          const body = { categories: ['furniture'] }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
          })

          cy.task<PostModel>('getPostByUserId', userId).then((post) => {
            expect(post.categories).to.deep.eq(['furniture'])
          })
        })
      })
    })

    describe('price', () => {
      it('422 - Invalid price', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { price: 'yes' }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(422)
                expect(res.body).to.have.property('message', err.PRICE_INVALID)
              }
            )
          })
        })
      })

      it('200 - Price updated', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { price: 50 }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(200)
              }
            )

            cy.task<PostModel>('getPostByUserId', userId).then((post) => {
              expect(post.price).to.eq(5000)
            })
          })
        })
      })
    })

    describe('images', () => {
      it('422 - Invalid images', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { images: 'yes' }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(422)
                expect(res.body).to.have.property('message', err.IMAGES_INVALID)
              }
            )
          })
        })
      })

      it('413 - image too big', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const base64 = Buffer.from(new Uint8Array(1000001)).toString(
              'base64'
            )
            const body = { images: [{ base64, ext: 'jpeg' }] }

            cy.req({ url, method: 'PUT', csrfToken: true, body }).then(
              (res) => {
                expect(res.status).to.eq(413)
                expect(res.body).to.have.property('message', err.IMAGE_TOO_BIG)
              }
            )
          })
        })
      })

      it('200 - Images updated', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.task('createFile', {
              data: 'data',
              ext: 'jpeg',
              dir: '/public/static/images/posts/',
              name: 'table',
            })

            cy.signIn(u1.email, u1.password)

            const images: IImage[] = []

            for (let i = 0; i < 5; i++) {
              const base64 = Buffer.from(new Uint8Array(1000000))
              images.push({ base64: base64.toString('base64'), ext: 'jpeg' })
            }

            const url = `/api/posts/${pId}`
            const body = { images }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(200)
              }
            )

            cy.task<PostModel>('getPostByUserId', userId).then(
              (updatedPost) => {
                expect(updatedPost.images).to.have.length(5)
                expect(updatedPost.images).to.not.have.members(p1.images)
              }
            )
          })

          cy.task('deleteImages', 'posts')
        })
      })
    })

    describe('address', () => {
      it('422 - Invalid address', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { address: 1 }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(422)
                expect(res.body).to.have.property(
                  'message',
                  err.ADDRESS_INVALID
                )
              }
            )
          })
        })
      })

      it('200 - address updated', function () {
        cy.task('reset')

        cy.task<string>('addUser', u1).then((userId) => {
          const p = { ...p1, userId }

          cy.task<string>('addPost', p).then((pId) => {
            cy.signIn(u1.email, u1.password)

            const url = `/api/posts/${pId}`
            const body = { address: 'Paris, France', latLon: [17, 22] }

            cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
              (res) => {
                expect(res.status).to.eq(200)
              }
            )

            cy.task<PostModel>('getPostByUserId', userId).then((post) => {
              expect(post.address).to.eq('Paris, France')
              expect(post.latLon).to.have.members([17, 22])
            })
          })
        })
      })
    })

    it('Do multiple updates at the same time', function () {
      cy.task('reset')

      cy.task<string>('addUser', u1).then((userId) => {
        const p = { ...p1, userId }

        cy.task<string>('addPost', p).then((pId) => {
          cy.signIn(u1.email, u1.password)

          const url = `/api/posts/${pId}`
          const body = { name: 'Trumpet', price: 50 }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
          })

          cy.task<PostModel>('getPostByUserId', userId).then((post) => {
            expect(post.name).to.eq('Trumpet')
            expect(post.price).to.eq(5000)
          })
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
      cy.task('reset')
      cy.task('addUser', u1)
      cy.signIn(u1.email, u1.password)

      const url = '/api/posts/f0f0f0f0f0f0f0f0f0f0f0f0'
      const body = { csrfToken: 'very invalid' }

      cy.req({ url, method: 'DELETE', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })

    it('422 - Cannot delete a post created by another user', function () {
      cy.task('reset')

      cy.task<string[]>('addUsers', JSON.stringify([u1, u2])).then(([u1Id]) => {
        const p = { ...p1, userId: u1Id }

        cy.task<string>('addPost', p).then((pId) => {
          cy.signIn(u2.email, u2.password)

          const url = `/api/posts/${pId}`

          cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.PARAMS_INVALID)
          })
        })
      })
    })

    it('200 - Post deleted', function () {
      cy.task('reset')

      cy.task<string>('addUser', u1).then((userId) => {
        cy.task<string>('addPost', { ...p1, userId }).then((pId) => {
          cy.task('createFile', {
            data: 'data',
            ext: 'jpeg',
            dir: '/public/static/images/posts/',
            name: 'table',
          })

          const discussion = {
            messages: [{ message: 'yo', userId: 'f0f0f0f0f0f0f0f0f0f0f0f0' }],
            postId: pId,
            postName: p1.name,
            buyerId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
            sellerId: 'f1f1f1f1f1f1f1f1f1f1f1f1',
          }

          cy.task<string>('addDiscussion', discussion).then((id) => {
            cy.signIn(u1.email, u1.password)

            const body = { favPostId: pId }
            cy.req({ url: '/api/user', method: 'PUT', body, csrfToken: true })

            const url = `/api/posts/${pId}`
            cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
              expect(res.status).to.eq(200)
            })

            cy.task('getPostByUserId', userId).then((post) => {
              expect(post).to.eq(null)
            })

            cy.task<UserModel>('getUser', userId).then((user) => {
              expect(user.postsIds).to.not.include(pId)
              expect(user.favPostsIds).to.not.include(pId)
            })

            cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
              // expect(d).to.eq(null)
              expect(d).not.to.have.property('postId')
            })
          })
        })
      })
    })
  })
})
