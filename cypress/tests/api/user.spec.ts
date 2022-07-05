import { UserModel } from '../../../models/User'
import err from '../../../utils/constants/errors'
import u1 from '../../fixtures/user1.json'
import u2 from '../../fixtures/user2.json'
import { Buffer } from 'buffer'
import { DiscussionModel } from '../../../models/Discussion'
import { IDiscussion } from '../../../types/common'

type Discussion = Omit<IDiscussion, 'id'>
const d1: Discussion = require('../../fixtures/discussion.json')

const url = '/api/user'

describe('/api/user', () => {
  it('405 - Method not allowed', function () {
    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  describe('POST', () => {
    it('422 - Invalid request body', function () {
      cy.req({ url, method: 'POST' }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message')
        expect(res.body).to.have.property('name')
      })
    })

    it('422 - Email already used', function () {
      cy.task('reset')
      cy.task('addUser', u1)

      const { name, email, password } = u1
      const body = { name, email, password }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_USED)
        expect(res.body).to.have.property('name', 'email')
      })
    })

    it('201 - User created', function () {
      cy.task('reset')

      const { name, email, password, image } = u1
      const body = { name, email, password }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(201)
        expect(res.headers['location']).to.eq('/profile')
      })

      cy.task<UserModel>('getUser', email).then((user) => {
        expect(user.name).to.eq(name)
        expect(user.email).to.eq(email)
        expect(user.password).to.not.eq(undefined)
        expect(user.image).to.eq(image)
      })
    })
  })

  describe('PUT', () => {
    it('403 - Forbidden', function () {
      cy.req({ url, method: 'PUT' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.task('reset')
      cy.task('addUser', u1)
      cy.signIn(u1.email, u1.password)

      const body = { csrfToken: 'very invalid', name: 'Carloman' }

      cy.req({ url, method: 'PUT', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })

    it('422 - Invalid request body', function () {
      cy.task('reset')
      cy.task('addUser', u1)
      cy.signIn(u1.email, u1.password)

      const url = '/api/user'
      const body = { oh: 'nooo!' }

      cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.DATA_INVALID)
      })
    })

    describe('name', () => {
      before(() => {
        cy.task('reset')
        cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
      })

      it('422 - Invalid name', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { name: { oh: 'nooo!' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.NAME_INVALID)
        })
      })

      it('200 - Name updated', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { name: 'John Doe' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<UserModel>('getUser', this.uId).then((user) => {
          expect(user.name).to.eq(body.name)
        })
      })
    })

    describe('email', () => {
      before(() => {
        cy.task('reset')
        cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
      })

      it('422 - Invalid email', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { email: { oh: 'nooo!' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.EMAIL_INVALID)
        })
      })

      it('200 - Email updated', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { email: 'superemail@test.com' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<UserModel>('getUser', this.uId).then((user) => {
          expect(user.email).to.eq('superemail@test.com')
        })
      })
    })

    describe('password', () => {
      before(() => {
        cy.task('reset')
        cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
      })

      it('422 - Invalid password', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { password: { oh: 'nooo!' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.PASSWORD_INVALID)
        })
      })

      it('200 - Password updated', function () {
        cy.signIn(u1.email, u1.password)

        cy.task<UserModel>('getUser', this.uId).then((user) => {
          const oldHash = (user.password as string).split(':')[1]

          const url = '/api/user'
          const body = { password: 'super oh nooo! pw' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
          })

          cy.task<UserModel>('getUser', this.uId).then((user) => {
            const newHash = (user.password as string).split(':')[1]
            expect(oldHash).to.not.eq(newHash)
          })
        })
      })
    })

    describe('image', () => {
      before(() => {
        cy.task('reset')
        cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
      })

      it('422 - Invalid image extension', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { image: { base64: 'text', ext: 'txt' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.IMAGE_INVALID)
        })
      })

      it('413 - Image too big', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const base64 = Buffer.from(new Uint8Array(1000001)).toString('base64')
        const body = { image: { base64, ext: 'jpeg' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(413)
          expect(res.body).to.have.property('message', err.IMAGE_TOO_BIG)
        })
      })

      it('200 - Image updated', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
        const body = { image: { base64, ext: 'jpeg' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<UserModel>('getUser', this.uId).then((u) => {
          expect(u.image).to.not.eq(u1.image)
        })

        cy.task('deleteImages', 'users')
      })
    })

    describe('favorite posts', () => {
      before(() => {
        cy.task('reset')
        cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
      })

      it('422 - Invalid favorite post id', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { favPostId: 'f' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.ID_INVALID)
        })
      })

      it('200 - Favorite posts updated', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { favPostId: 'f0f0f0f0f0f0f0f0f0f0f0f0' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<UserModel>('getUser', this.uId).then((user) => {
          expect(user.favPostsIds).to.include(body.favPostId)
        })

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<UserModel>('getUser', this.uId).then((user) => {
          expect(user.favPostsIds).to.not.include(body.favPostId)
        })
      })
    })

    describe('discussion', () => {
      before(() => {
        cy.task('reset')
        cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
      })

      it('422 - Invalid discussion id', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { discussionId: 'f' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.ID_INVALID)
        })
      })

      it('200 - Discussion id updated', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/user'
        const body = { discussionId: 'f0f0f0f0f0f0f0f0f0f0f0f0' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<UserModel>('getUser', this.uId).then((user) => {
          expect(user.discussionsIds).to.include(body.discussionId)
        })

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<UserModel>('getUser', this.uId).then((user) => {
          expect(user.discussionsIds).to.not.include(body.discussionId)
        })
      })
    })
  })

  describe('DELETE', () => {
    before(() => {
      cy.task('reset')
      cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
    })

    it('403 - Forbidden', function () {
      cy.req({ url, method: 'DELETE' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.signIn(u1.email, u1.password)

      const body = { csrfToken: '100% certified - very secure token' }

      cy.req({ url, method: 'DELETE', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })

    it('200 - Delete the user and its posts', function () {
      cy.signIn(u1.email, u1.password)

      const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
      const img = { image: { base64, ext: 'jpeg' } }
      cy.req({ url, method: 'PUT', body: img, csrfToken: true })

      const body = {
        name: 'Cat',
        description: 'Magnificent cat',
        categories: ['cat'],
        price: 50,
        images: [img.image],
      }
      cy.req({ url: '/api/post', method: 'POST', body, csrfToken: true })

      cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(200)
      })

      cy.task('getUser', this.uId).then((user) => {
        expect(user).to.eq(null)
      })

      cy.task('getAccountByUserId', this.uId).then((account) => {
        expect(account).to.eq(null)
      })

      cy.task('getPostByUserId', this.uId).then((post) => {
        expect(post).to.eq(null)
      })
    })

    describe('When deleting the user it', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.task<string>('addUsers', JSON.stringify([u1, u2])).then((ids) => {
          cy.wrap(ids[0]).as('u1Id')
          cy.wrap(ids[1]).as('u2Id')
        })
      })

      it("deletes the discussions where the other user doesn't exist", function () {
        cy.signIn(u1.email, u1.password)

        const discussion = {
          ...d1,
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
        }

        cy.task('addDiscussion', discussion).then(() => {
          cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
          })
          cy.task<DiscussionModel>(
            'getDiscussionByPostId',
            discussion.postId
          ).then((d) => {
            expect(d).not.to.exist
          })
        })
      })

      it("deletes the discussions where the other user exist and doesn't have the discussion id", function () {
        const discussion = {
          ...d1,
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
          sellerId: this.u2Id,
        }

        cy.task<string>('addDiscussion', discussion).then((dId) => {
          cy.signIn(u2.email, u2.password)

          const body = { discussionId: dId }
          cy.req({ url: '/api/user', method: 'PUT', body, csrfToken: true })

          cy.signIn(u1.email, u1.password)

          cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
          })

          cy.task<DiscussionModel>(
            'getDiscussionByPostId',
            discussion.postId
          ).then((d) => {
            expect(d).not.to.exist
          })
        })
      })

      it("deletes the discussion's field that reference the user if the other user exist and have the discussion id", function () {
        cy.signIn(u1.email, u1.password)

        const discussion = {
          messages: d1.messages,
          postName: d1.postName,
          channelName: d1.channelName,
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
          sellerId: this.u2Id,
        }

        cy.task('addDiscussion', discussion).then(() => {
          cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
          })

          cy.task<DiscussionModel>(
            'getDiscussionByPostId',
            discussion.postId
          ).then((d) => {
            expect(d.buyerId).not.to.exist
          })
        })
      })
    })
  })
})
