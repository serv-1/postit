import { Types } from 'mongoose'
import { IPost } from '../../../../models/Post'
import err from '../../../../utils/constants/errors'

interface Response {
  posts: (IPost & { _id: Types.ObjectId })[]
  totalPages: number
  totalPosts: number
}

let url = '/api/posts/search'

describe('/api/posts/search', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed', { posts: true })
  })
  beforeEach(() => (url = '/api/posts/search'))

  it('405 - Method not allowed', () => {
    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  it('422 - Invalid request query', () => {
    cy.req({ url }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('name', 'query')
      expect(res.body).to.have.property('message', err.QUERY_REQUIRED)
    })
  })

  it('200 - No posts found', () => {
    url += '?query=computer'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(0)
      expect(res.body.totalPosts).to.eq(0)
      expect(res.body.posts.length).to.eq(0)
    })
  })

  it('200 - Posts found by query', () => {
    url += '?query=Table'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(1)
      expect(res.body.totalPosts).to.eq(2)
      for (const post of res.body.posts) {
        expect(post.name).to.have.string('Table')
      }
    })
  })

  it('200 - Posts found by maxPrice', () => {
    url += '?query=Cat&maxPrice=30'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.be.at.least(1)
      expect(res.body.totalPosts).to.be.at.least(1)

      for (const post of res.body.posts) {
        expect(post.price).to.be.at.most(30)
      }
    })
  })

  it('200 - Posts found by minPrice', () => {
    url += '?query=Cat&minPrice=50'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.be.at.least(1)
      expect(res.body.totalPosts).to.be.at.least(1)

      for (const post of res.body.posts) {
        expect(post.price).to.be.at.least(50)
      }
    })
  })

  it('200 - Posts found by minPrice and maxPrice', () => {
    url += '?query=Cat&minPrice=30&maxPrice=60'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.be.at.least(1)
      expect(res.body.totalPosts).to.be.at.least(1)

      for (const post of res.body.posts) {
        expect(post.price).to.be.at.most(60)
        expect(post.price).to.be.at.least(30)
      }
    })
  })

  it('200 - Posts found by category', () => {
    url += '?query=Cat&categories[]=pet'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.be.at.least(1)
      expect(res.body.totalPosts).to.be.at.least(1)

      for (const post of res.body.posts) {
        expect(post.categories).to.include('pet')
      }
    })
  })

  it('200 - Posts found by categories', () => {
    url += '?query=Cat&categories[]=pet&categories[]=cat'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.be.at.least(1)
      expect(res.body.totalPosts).to.be.at.least(1)

      for (const post of res.body.posts) {
        expect(post.categories).to.have.members(['pet', 'cat'])
      }
    })
  })

  it('200 - Posts found by page', () => {
    url += '?query=Cat'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.be.at.least(1)
      expect(res.body.totalPosts).to.be.at.least(1)

      const page1 = res.body.posts.map((post) => post._id.toString())

      cy.req<Response>({ url: url + '&page=2' }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.totalPages).to.be.at.least(1)
        expect(res.body.totalPosts).to.be.at.least(1)

        const page2 = res.body.posts.map((post) => post._id.toString())

        expect(page1).to.not.have.members(page2)
      })
    })
  })
})
