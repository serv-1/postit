import err from '../../../../utils/errors'
import { Buffer } from 'buffer'
import { dbSeedResult } from '../../../plugins'
import { IUser } from '../../../../models/User'

describe('/api/users/:id', () => {
  beforeEach(() => {
    cy.task<null>('db:reset')
    cy.task<dbSeedResult>('db:seed').then((result) => {
      cy.wrap(result.u1Id).as('u1Id')
      cy.wrap(result.u2Id).as('u2Id')
      cy.wrap(`/api/users/${result.u1Id}`).as('url')
    })
    cy.fixture('user').as('user')
  })

  it('405 - Method not allowed', function () {
    cy.req({ url: this.url, method: 'PATCH' }).then((res) => {
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
      cy.req({ url: this.url }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('id', this.u1Id)
        expect(res.body).to.have.ownProperty('name')
        expect(res.body).to.have.ownProperty('email')
        expect(res.body).to.have.ownProperty('image')
      })
    })
  })

  describe('PUT', () => {
    const method = 'PUT'

    it('403 - Forbidden', function () {
      cy.req({ url: this.url, method }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('should not update if a CSRF token is invalid', function () {
      cy.signIn(this.user.email, this.user.password)
      cy.req({
        url: this.url,
        method,
        body: { csrfToken: 'very invalid', name: 'Carloman' },
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.DATA_INVALID)
      })
    })

    it('should not allow a user to update another user', function () {
      cy.signIn(this.user.email, this.user.password)
      cy.req({
        url: `/api/users/${this.u2Id}`,
        method,
        body: { name: 'Yes, I have renamed you!' },
        csrfToken: true,
      }).then((res) => {
        expect(res.status).to.eq(422)
        cy.task<IUser>('db:getUserById', this.u2Id).then((user) => {
          expect(user.name).to.not.eq('Yes, I have renamed you!')
        })
      })
    })

    it('422 - Invalid request body', function () {
      cy.signIn(this.user.email, this.user.password)
      cy.req({ url: this.url, method, body: { oh: 'nooo!' } }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.DATA_INVALID)
      })
    })

    describe('name', () => {
      beforeEach(function () {
        cy.signIn(this.user.email, this.user.password)
      })

      it('422 - Invalid name', function () {
        const name = { oh: 'nooo!' }
        cy.req({ url: this.url, method, body: { name }, csrfToken: true }).then(
          (res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.NAME_INVALID)
          }
        )
      })

      it('200 - Name updated', function () {
        const name = 'John Doe'
        cy.req({ url: this.url, method, body: { name }, csrfToken: true }).then(
          (res) => {
            expect(res.status).to.eq(200)
            cy.task<IUser>('db:getUserById', this.u1Id).then((user) => {
              expect(user.name).to.eq(name)
            })
          }
        )
      })
    })

    describe('email', () => {
      beforeEach(function () {
        cy.signIn(this.user.email, this.user.password)
      })

      it('422 - Invalid email', function () {
        cy.req({
          url: this.url,
          method,
          body: { email: { oh: 'nooo!' } },
          csrfToken: true,
        }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.EMAIL_INVALID)
        })
      })

      it('200 - Email updated', function () {
        cy.req({
          url: this.url,
          method,
          body: { email: 'superemail@test.com' },
          csrfToken: true,
        }).then((res) => {
          expect(res.status).to.eq(200)
          cy.task<IUser>('db:getUserById', this.u1Id).then((user) => {
            expect(user.email).to.eq('superemail@test.com')
          })
        })
      })
    })

    describe('password', () => {
      beforeEach(function () {
        cy.signIn(this.user.email, this.user.password)
      })

      it('422 - Invalid password', function () {
        cy.req({
          url: this.url,
          method,
          body: { password: { oh: 'nooo!' } },
          csrfToken: true,
        }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.PASSWORD_INVALID)
        })
      })

      it('200 - Password updated', function () {
        cy.task<IUser>('db:getUserById', this.u1Id).then((user) => {
          const oldHash = (user.password as string).split(':')[1]
          cy.req({
            url: this.url,
            method,
            body: { password: 'super oh nooo! pw' },
            csrfToken: true,
          }).then((res) => {
            cy.task<IUser>('db:getUserById', this.u1Id).then((user) => {
              const newHash = (user.password as string).split(':')[1]
              expect(res.status).to.eq(200)
              expect(oldHash).to.not.eq(newHash)
            })
          })
        })
      })
    })

    describe('image', () => {
      beforeEach(function () {
        cy.signIn(this.user.email, this.user.password)
      })

      it('422 - Invalid file type', function () {
        cy.req({
          url: this.url,
          method,
          body: { image: { base64Uri: 'text', type: 'text/plain' } },
          csrfToken: true,
        }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.USER_IMAGE_INVALID)
        })
      })

      it('422 - Invalid file data', function () {
        cy.req({
          url: this.url,
          method,
          body: { image: { base64Uri: 'not base 64 uri', type: 'image/jpeg' } },
          csrfToken: true,
        }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.DATA_INVALID)
        })
      })

      it('413 - File too large', function () {
        const type = 'image/jpeg'
        const base64 = Buffer.from(new Uint8Array(1000001)).toString('base64')
        cy.req({
          url: this.url,
          method,
          body: { image: { base64Uri: `data:${type};base64,${base64}`, type } },
          csrfToken: true,
        }).then((res) => {
          expect(res.status).to.eq(413)
          expect(res.body).to.have.property('message', err.USER_IMAGE_TOO_LARGE)
        })
      })

      it('200 - Image updated', function () {
        const type = 'image/jpeg'
        const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
        cy.req({
          url: this.url,
          method,
          body: { image: { base64Uri: `data:${type};base64,${base64}`, type } },
          csrfToken: true,
        }).then((res) => {
          expect(res.status).to.eq(200)
          cy.task<IUser>('db:getUserById', this.u1Id).then((user) => {
            expect(user.image.contentType).to.eq(type)
            const dbBase64 = Buffer.from(user.image.data).toString('base64')
            expect(dbBase64).to.eq(base64)
          })
        })
      })
    })
  })

  describe('DELETE', () => {
    const method = 'DELETE'

    it('403 - Forbidden', function () {
      cy.req({ url: this.url, method }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('should not update if the CSRF token is invalid', function () {
      cy.signIn(this.user.email, this.user.password)
      cy.req({
        url: this.url,
        method,
        body: { csrfToken: '100% certified - very secure token' },
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.DATA_INVALID)
      })
    })

    it('should not allow a user to delete another user', function () {
      cy.signIn(this.user.email, this.user.password)
      cy.req({ url: `/api/users/${this.u2Id}`, method, csrfToken: true }).then(
        (res) => {
          expect(res.status).to.eq(422)
          cy.task<IUser>('db:getUserById', this.u2Id).then((user) => {
            expect(user).to.not.be.null
          })
        }
      )
    })

    it('200 - Delete the user', function () {
      cy.signIn(this.user.email, this.user.password)
      cy.req({ url: this.url, method, csrfToken: true }).then((res) => {
        expect(res.status).to.eq(200)
        cy.task<null>('db:getUserById', this.u1Id).then((user) => {
          expect(user).to.eq(null)
        })
      })
    })
  })
})
