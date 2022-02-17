import err from '../../../../utils/constants/errors'
import { Buffer } from 'buffer'
import { Ids } from '../../../plugins'
import { IUser } from '../../../../models/User'
import u1 from '../../../fixtures/user1.json'

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

  describe('PUT', () => {
    it('403 - Forbidden', function () {
      const url = '/api/users/f0f0f0f0f0f0f0f0f0f0f0f0'

      cy.req({ url, method: 'PUT' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const body = { csrfToken: 'very invalid', name: 'Carloman' }

        cy.req({ url, method: 'PUT', body }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
        })
      })
    })

    it('should not allow a user to update another user', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u2Id}`
        const body = { name: 'Yes, I have renamed you!' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
        })

        cy.task<IUser>('db:getUser', ids.u2Id).then((user) => {
          expect(user.name).to.not.eq('Yes, I have renamed you!')
        })
      })
    })

    it('422 - Invalid request body', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
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
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const body = { name: { oh: 'nooo!' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.NAME_INVALID)
        })
      })
    })

    it('200 - Name updated', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const body = { name: 'John Doe' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<IUser>('db:getUser', ids.u1Id).then((user) => {
          expect(user.name).to.eq(body.name)
        })
      })
    })
  })

  describe('email', () => {
    it('422 - Invalid email', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const body = { email: { oh: 'nooo!' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.EMAIL_INVALID)
        })
      })
    })

    it('200 - Email updated', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const body = { email: 'superemail@test.com' }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<IUser>('db:getUser', ids.u1Id).then((user) => {
          expect(user.email).to.eq('superemail@test.com')
        })
      })
    })
  })

  describe('password', () => {
    it('422 - Invalid password', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const body = { password: { oh: 'nooo!' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.PASSWORD_INVALID)
        })
      })
    })

    it('200 - Password updated', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        cy.task<IUser>('db:getUser', ids.u1Id).then((user) => {
          const oldHash = (user.password as string).split(':')[1]

          const url = `/api/users/${ids.u1Id}`
          const body = { password: 'super oh nooo! pw' }

          cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)
          })

          cy.task<IUser>('db:getUser', ids.u1Id).then((user) => {
            const newHash = (user.password as string).split(':')[1]
            expect(oldHash).to.not.eq(newHash)
          })
        })
      })
    })
  })

  describe('image', () => {
    it('422 - Invalid image type', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const body = { image: { base64: 'text', type: 'txt' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.IMAGE_INVALID)
        })
      })
    })

    it('413 - Image too big', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const base64 = Buffer.from(new Uint8Array(1000001)).toString('base64')
        const body = { image: { base64, type: 'jpeg' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(413)
          expect(res.body).to.have.property('message', err.IMAGE_TOO_BIG)
        })
      })
    })

    it('200 - Image updated', function () {
      cy.task('db:reset')

      cy.task<Ids>('db:seed').then((ids) => {
        cy.signIn(u1.email, u1.password)

        const url = `/api/users/${ids.u1Id}`
        const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
        const body = { image: { base64, type: 'jpeg' } }

        cy.req({ url, method: 'PUT', body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<IUser>('db:getUser', ids.u1Id).then((u) => {
          expect(u.image).to.not.eq(u1.image)
        })
      })

      cy.task('deleteImages', 'users')
    })
  })
})

describe('DELETE', () => {
  it('403 - Forbidden', function () {
    const url = '/api/users/f0f0f0f0f0f0f0f0f0f0f0f0'

    cy.req({ url, method: 'DELETE' }).then((res) => {
      expect(res.status).to.eq(403)
      expect(res.body).to.have.property('message', err.FORBIDDEN)
    })
  })

  it('422 - Invalid CSRF token', function () {
    cy.task('db:reset')

    cy.task<Ids>('db:seed').then((ids) => {
      cy.signIn(u1.email, u1.password)

      const url = `/api/users/${ids.u1Id}`
      const body = { csrfToken: '100% certified - very secure token' }

      cy.req({ url, method: 'DELETE', body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })
  })

  it('should not allow a user to delete another user', function () {
    cy.task('db:reset')

    cy.task<Ids>('db:seed').then((ids) => {
      cy.signIn(u1.email, u1.password)

      const url = `/api/users/${ids.u2Id}`

      cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(422)
      })

      cy.task<IUser>('db:getUser', ids.u2Id).then((user) => {
        expect(user).to.not.be.null
      })
    })
  })

  it("200 - Delete the user and it's image with it's related account", function () {
    cy.task('db:reset')

    cy.task<Ids>('db:seed').then((ids) => {
      cy.signIn(u1.email, u1.password)

      const url = `/api/users/${ids.u1Id}`

      const base64 = Buffer.from(new Uint8Array(1)).toString('base64')
      const body = { image: { base64, type: 'jpeg' } }

      cy.req({ url, method: 'PUT', body, csrfToken: true })

      cy.req({ url, method: 'DELETE', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(200)
      })

      cy.task('db:getUser', ids.u1Id).then((user) => {
        expect(user).to.eq(null)
      })

      cy.task('db:getAccountByUserId', ids.u1Id).then((account) => {
        expect(account).to.eq(null)
      })
    })
  })
})
