import err from '../../../utils/constants/errors'
import { Buffer } from 'buffer'
import { Ids } from '../../plugins'
import { IPost } from '../../../models/Post'
import u1 from '../../fixtures/user1.json'

const url = '/api/post'

const defaultBody = {
  name: 'Modern table',
  description: 'Very very modern table',
  categories: ['furniture'],
  price: 4000,
  images: [createImage(10), createImage(20)],
}

describe('/api/post', () => {
  before(() => {
    cy.task('db:reset')
    cy.task<Ids>('db:seed').then((result) => {
      cy.wrap(result.u1Id).as('u1Id')
    })
  })

  it('405 - Method not allowed', function () {
    cy.signIn(u1.email, u1.password)

    cy.req({ url, method: 'PATCH', csrfToken: true }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  describe('POST', () => {
    it('403 - Forbidden', () => {
      cy.req({ url, method: 'POST' }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.signIn(u1.email, u1.password)

      cy.req({ url, method: 'POST' }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.DATA_INVALID)
      })
    })

    it('422 - Invalid request body', function () {
      cy.signIn(u1.email, u1.password)

      cy.req({ url, method: 'POST', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('name', 'name')
        expect(res.body).to.have.property('message', err.NAME_REQUIRED)
      })
    })

    it('422 - Invalid price', function () {
      cy.signIn(u1.email, u1.password)

      const body = { ...defaultBody, price: 1.123 }

      cy.req({ url, method: 'POST', csrfToken: true, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('name', 'price')
        expect(res.body).to.have.property('message', err.PRICE_INVALID)
      })
    })

    it('422 - Invalid image type', function () {
      cy.signIn(u1.email, u1.password)

      const image = { ...createImage(0), base64Uri: 'not a base64 uri' }
      const body = { ...defaultBody, images: [image] }

      cy.req({ url, method: 'POST', csrfToken: true, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('name', 'images')
        expect(res.body).to.have.property('message', err.IMAGES_INVALID)
      })
    })

    it('413 - image too large', function () {
      cy.signIn(u1.email, u1.password)

      const body = { ...defaultBody, images: [createImage(1000001)] }

      cy.req({ url, method: 'POST', csrfToken: true, body }).then((res) => {
        expect(res.status).to.eq(413)
        expect(res.body).to.have.property('name', 'images')
        expect(res.body).to.have.property('message', err.IMAGE_TOO_LARGE)
      })
    })

    it('200 - Post created', function () {
      cy.signIn(u1.email, u1.password)

      const body = {
        ...defaultBody,
        images: [
          createImage(1000000),
          createImage(1000000),
          createImage(1000000),
          createImage(1000000),
          createImage(1000000),
        ],
      }

      cy.req({ url, method: 'POST', csrfToken: true, body }).then((res) => {
        expect(res.status).to.eq(200)

        cy.task<IPost>('db:getPostByUserId', this.u1Id).then((post) => {
          expect(post).not.to.eq(null)
          expect(post.price).to.eq(defaultBody.price * 100)
          expect(post.userId).to.eq(this.u1Id)
          expect(post.images.length).to.eq(5)
        })
      })
    })
  })
})

function createImage(size: number) {
  const data = new Uint8Array(size)
  const base64 = Buffer.from(data).toString('base64')

  return {
    base64Uri: 'data:image/jpeg;base64,' + base64,
    type: 'image/jpeg',
  }
}
