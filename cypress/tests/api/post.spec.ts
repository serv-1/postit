import err from '../../../utils/constants/errors'
import { Buffer } from 'buffer'
import { UsersIds } from '../../plugins'
import { IPost } from '../../../models/Post'
import user from '../../fixtures/user.json'

const url = '/api/post'

const defaultBody = {
  name: 'Modern table',
  description: 'Very very modern table',
  categories: ['furniture'],
  price: 4000,
  images: [createImage(10), createImage(20)],
}

before(() => {
  cy.task('db:reset')
  cy.task<UsersIds>('db:seed').then((result) => {
    cy.wrap(result.uId).as('uId')
  })
})

it('405 - Method not allowed', function () {
  cy.signIn(user.email, user.password)
  cy.req({ url, method: 'PATCH', csrfToken: true }).then((res) => {
    expect(res.status).to.eq(405)
    expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
  })
})

describe('POST', () => {
  const method = 'POST'

  it('403 - Forbidden', () => {
    cy.req({ url, method }).then((res) => {
      expect(res.status).to.eq(403)
      expect(res.body).to.have.property('message', err.FORBIDDEN)
    })
  })

  it('422 - Invalid CSRF token', function () {
    cy.signIn(user.email, user.password)
    cy.req({ url, method }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('message', err.DATA_INVALID)
    })
  })

  it('422 - Invalid request body', function () {
    cy.signIn(user.email, user.password)
    cy.req({ url, method, csrfToken: true }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('name', 'name')
      expect(res.body).to.have.property('message', err.NAME_REQUIRED)
    })
  })

  it('422 - Invalid price', function () {
    cy.signIn(user.email, user.password)
    const body = { ...defaultBody, price: 1.123 }
    cy.req({ url, method, csrfToken: true, body }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('name', 'price')
      expect(res.body).to.have.property('message', err.PRICE_INVALID)
    })
  })

  it('422 - Invalid image type', function () {
    cy.signIn(user.email, user.password)

    const image = { ...createImage(0), base64Uri: 'not a base64 uri' }
    const body = { ...defaultBody, images: [image] }

    cy.req({ url, method, csrfToken: true, body }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('name', 'images')
      expect(res.body).to.have.property('message', err.IMAGES_INVALID)
    })
  })

  it('413 - image too large', function () {
    cy.signIn(user.email, user.password)

    const body = { ...defaultBody, images: [createImage(1000001)] }

    cy.req({ url, method, csrfToken: true, body }).then((res) => {
      expect(res.status).to.eq(413)
      expect(res.body).to.have.property('name', 'images')
      expect(res.body).to.have.property('message', err.IMAGE_TOO_LARGE)
    })
  })

  it('200 - Post created', function () {
    cy.signIn(user.email, user.password)

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

    cy.req({ url, method, csrfToken: true, body, timeout: 90000 }).then(
      (res) => {
        expect(res.status).to.eq(200)

        cy.task<IPost>('db:getPostByUserId', this.uId).then((post) => {
          expect(post).not.to.eq(null)
          expect(post.price).to.eq(defaultBody.price * 100)
          expect(post.userId).to.eq(this.uId)
        })
      }
    )
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
