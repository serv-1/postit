import { UserModel } from '../../../models/User'
import err from '../../../utils/constants/errors'
import u1 from '../../fixtures/user1.json'
import { Buffer } from 'buffer'

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

    it('200 - User created', function () {
      cy.task('reset')

      const { name, email, password, image } = u1
      const body = { name, email, password }

      cy.req({ url, method: 'POST', body }).then((res) => {
        expect(res.status).to.eq(200)
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
      cy.req({ url: '/api/user', method: 'PUT' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.task('reset')
      cy.task('addUser', u1)
      cy.signIn(u1.email, u1.password)

      const body = { csrfToken: 'very invalid', name: 'Carloman' }

      cy.req({ url: '/api/user', method: 'PUT', body }).then((res) => {
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
  })

  describe('DELETE', () => {
    before(() => {
      cy.task('reset')
      cy.task<string>('addUser', u1).then((uId) => cy.wrap(uId).as('uId'))
    })

    it('403 - Forbidden', function () {
      cy.req({ url: '/api/user', method: 'DELETE' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.signIn(u1.email, u1.password)

      const body = { csrfToken: '100% certified - very secure token' }

      cy.req({ url: '/api/user', method: 'DELETE', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })

    it("200 - Delete the user and it's posts", function () {
      cy.signIn(u1.email, u1.password)

      // Change the user image
      const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
      const img = { image: { base64, ext: 'jpeg' } }
      cy.req({ url: '/api/user', method: 'PUT', body: img, csrfToken: true })

      // Create a post with the user
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
  })
})
