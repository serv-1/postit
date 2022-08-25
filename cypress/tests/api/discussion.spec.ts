import { DiscussionModel } from '../../../models/Discussion'
import { PostModel } from '../../../models/Post'
import { UserModel } from '../../../models/User'
import {
  DeferredPromise,
  DiscussionEventData,
  IPost,
} from '../../../types/common'
import err from '../../../utils/constants/errors'
import u1 from '../../fixtures/user1.json'
import u2 from '../../fixtures/user2.json'
import getClientPusher from '../../../utils/functions/getClientPusher'

type Posts = Omit<IPost, 'id' | 'userId'>[]
const [p1]: Posts = require('../../fixtures/posts.json')

describe('/api/discussion', () => {
  const url = '/api/discussion'
  const id = 'f0f0f0f0f0f0f0f0f0f0f0f0'

  before(() => {
    cy.task('reset')
    cy.task<string>('addUser', u1).then((id) => {
      cy.wrap(id).as('u1Id')
    })
  })

  it('405 - Method not allowed', function () {
    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  it('403 - Forbidden', function () {
    cy.req({ url, method: 'POST' }).then((res) => {
      expect(res.status).to.eq(403)
      expect(res.body).to.have.property('message', err.FORBIDDEN)
    })
  })

  describe('POST', () => {
    const method = 'POST'
    const body = {
      message: 'yo',
      postId: id,
      sellerId: id,
      postName: 'table',
    }

    it('422 - Invalid request body', function () {
      cy.signIn(u1.email, u1.password)

      cy.req({ url, method }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.MESSAGE_REQUIRED)
      })
    })

    it('422 - Invalid csrf token', function () {
      cy.signIn(u1.email, u1.password)

      cy.req({ url, method, body }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })

    it('404 - Seller not found', function () {
      cy.signIn(u1.email, u1.password)

      cy.req({ url, method, body, csrfToken: true }).then((res) => {
        expect(res.status).to.eq(404)
        expect(res.body).to.have.property('message', err.USER_NOT_FOUND)
      })
    })

    it('201 - Discussion created', function () {
      cy.task('reset')

      const pusher = getClientPusher()

      cy.task<string[]>('addUsers', JSON.stringify([u1, u2])).then(
        ([u1Id, u2Id]) => {
          cy.signIn(u1.email, u1.password)

          cy.task<string>('addPost', { ...p1, userId: u1Id }).then((pId) => {
            const b = { ...body, postId: pId, sellerId: u2Id }

            const eventName = 'discussion-created'
            let u1Deferred: DeferredPromise<DiscussionEventData> | null = null
            let u2Deferred: DeferredPromise<DiscussionEventData> | null = null

            const u1Promise = new Promise<DiscussionEventData>(
              (resolve, reject) => (u1Deferred = { resolve, reject })
            )
            const u2Promise = new Promise<DiscussionEventData>(
              (resolve, reject) => (u2Deferred = { resolve, reject })
            )

            cy.task<UserModel>('getUser', u1Id).then((u) => {
              const channel = pusher.subscribe('private-' + u.channelName)
              channel.bind(eventName, (data: DiscussionEventData) => {
                u1Deferred?.resolve(data)
              })
            })

            cy.task<UserModel>('getUser', u2Id).then((u) => {
              const channel = pusher.subscribe('private-' + u.channelName)
              channel.bind(eventName, (data: DiscussionEventData) => {
                u2Deferred?.resolve(data)
              })
            })

            cy.req({ url, method, body: b, csrfToken: true }).then((res) => {
              expect(res.status).to.eq(201)

              cy.task<DiscussionModel>('getDiscussion', body.postName).then(
                (d) => {
                  expect(d.messages[0]).to.have.property('createdAt')
                  expect(d.messages[0]).to.have.property('seen', false)
                  expect(d.messages[0]).to.have.property('userId', u1Id)
                  expect(d.messages[0]).to.have.property('message', b.message)
                  expect(d.channelName).to.exist
                  expect(d).to.include({
                    postId: pId,
                    buyerId: u1Id,
                    sellerId: u2Id,
                    postName: b.postName,
                  })

                  cy.task<PostModel>('getPostByUserId', u1Id).then((p) => {
                    expect(p.discussionsIds).to.include(d._id)
                  })

                  cy.task<UserModel>('getUser', u1Id).then((u) => {
                    expect(u.discussionsIds).to.include(d._id)
                  })

                  cy.task<UserModel>('getUser', u2Id).then((u) => {
                    expect(u.discussionsIds).to.include(d._id)
                    expect(u.hasUnseenMessages).to.be.true
                  })

                  u1Promise.then((data) => {
                    expect(data).to.eql({
                      discussionId: d._id.toString(),
                      userId: u1Id,
                    })
                  })
                  u2Promise.then((data) => {
                    expect(data).to.eql({
                      discussionId: d._id.toString(),
                      userId: u1Id,
                    })
                  })

                  pusher.disconnect()
                }
              )
            })
          })
        }
      )
    })
  })
})
