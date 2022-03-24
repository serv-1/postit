import { Types } from 'mongoose'
import { PostModel } from '../../../../models/Post'
import { IPost } from '../../../../types/common'
import err from '../../../../utils/constants/errors'

interface Response {
  posts: Omit<IPost, 'user'>[]
  totalPages: number
  totalPosts: number
}

describe('/api/posts/search', () => {
  before(() => {
    cy.task('reset')

    const posts: Omit<PostModel, '_id'>[] = []

    for (let i = 1; i < 41; i++) {
      const color = i <= 4 ? 'Blue' : 'Red'

      posts.push({
        name: `${color} Cat ${i}`,
        description: `Awesome ${color} Cat ${i}`,
        categories: i <= 4 ? ['pet'] : ['pet', 'cat'],
        price: i <= 4 ? i * 2 * 1000 : i * 10000,
        images: ['cat' + i + '.jpeg'],
        userId: new Types.ObjectId('f0f0f0f0f0f0f0f0f0f0f0f0'),
      })
    }

    cy.task('addPosts', JSON.stringify(posts))
  })

  it('405 - Method not allowed', () => {
    cy.req({ url: '/api/posts/search', method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  it('422 - Invalid request query', () => {
    cy.req({ url: '/api/posts/search' }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('name', 'query')
      expect(res.body).to.have.property('message', err.QUERY_REQUIRED)
    })
  })

  it('200 - No posts found', () => {
    cy.req<Response>({ url: '/api/posts/search?query=sofa' }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.eql({ totalPages: 0, totalPosts: 0, posts: [] })
    })
  })

  it('200 - Posts found by query', () => {
    cy.req<Response>({ url: '/api/posts/search?query=Blue' }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(1)
      expect(res.body.totalPosts).to.eq(4)
      expect(res.body.posts[0].name).to.eq('Blue Cat 1')
    })
  })

  it('200 - Posts found by maxPrice', () => {
    const url = '/api/posts/search?query=Blue&maxPrice=40'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(1)
      expect(res.body.totalPosts).to.eq(2)
      expect(res.body.posts[0].price).to.eq(20)
      expect(res.body.posts[1].price).to.eq(40)
    })
  })

  it('200 - Posts found by minPrice', () => {
    const url = '/api/posts/search?query=Blue&minPrice=60'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(1)
      expect(res.body.totalPosts).to.eq(2)
      expect(res.body.posts[0].price).to.eq(60)
      expect(res.body.posts[1].price).to.eq(80)
    })
  })

  it('200 - Posts found by minPrice and maxPrice', () => {
    const url = '/api/posts/search?query=Blue&minPrice=20&maxPrice=60'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(1)
      expect(res.body.totalPosts).to.eq(3)
      expect(res.body.posts[0].price).to.eq(20)
      expect(res.body.posts[1].price).to.eq(40)
      expect(res.body.posts[2].price).to.eq(60)
    })
  })

  it('200 - Posts found by category', () => {
    const url = '/api/posts/search?query=Cat&categories=pet'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(2)
      expect(res.body.totalPosts).to.eq(40)
    })
  })

  it('200 - Posts found by categories', () => {
    const url = '/api/posts/search?query=Cat&categories=pet&categories=cat'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(2)
      expect(res.body.totalPosts).to.eq(36)
    })
  })

  it('200 - Posts found by page', () => {
    const url = '/api/posts/search?query=Cat'

    cy.req<Response>({ url }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.totalPages).to.eq(2)
      expect(res.body.totalPosts).to.eq(40)

      const page1 = res.body.posts.map((post) => post.id)

      cy.req<Response>({ url: url + '&page=2' }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.totalPages).to.eq(2)
        expect(res.body.totalPosts).to.eq(40)

        const page2 = res.body.posts.map((post) => post.id)

        expect(page1).to.not.have.members(page2)
      })
    })
  })
})
