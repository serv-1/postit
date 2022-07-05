import { DiscussionModel } from '../../../../models/Discussion'
import { IDiscussion } from '../../../../types/common'
import err from '../../../../utils/constants/errors'
import u1 from '../../../fixtures/user1.json'
import u2 from '../../../fixtures/user2.json'

type Discussion = Omit<IDiscussion, 'id'>
const d1: Discussion = require('../../../fixtures/discussion.json')

const url = '/api/discussions/f0f0f0f0f0f0f0f0f0f0f0f0'

describe('/api/discussions/{id}', () => {
  before(() => {
    cy.task('reset')
    cy.task<string>('addUsers', JSON.stringify([u1, u2])).then((ids) => {
      cy.wrap(ids[0]).as('u1Id')

      const discussion = {
        ...d1,
        postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
        buyerId: ids[0],
        sellerId: 'f1f1f1f1f1f1f1f1f1f1f1f1',
      }
      cy.wrap(discussion).as('d')

      cy.task<string>('addDiscussion', discussion).then((id) => {
        cy.wrap(id).as('dId')
      })
    })
  })

  describe('', () => {
    it('405 - Method not allowed', function () {
      cy.signIn(u1.email, u1.password)

      const url = '/api/discussions/' + this.dId

      cy.req({ url, method: 'PATCH', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(405)
        expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
      })
    })

    it('422 - Invalid id', function () {
      const url = '/api/discussions/1'

      cy.req({ url, method: 'PUT', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.PARAMS_INVALID)
      })
    })

    it('403 - Forbidden', function () {
      cy.req({ url, method: 'PUT', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    it('422 - Invalid CSRF token', function () {
      cy.signIn(u1.email, u1.password)

      cy.req({ url, method: 'PUT' }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })

      cy.req({ url, method: 'PUT', body: { csrfToken: 'no' } }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.CSRF_TOKEN_INVALID)
      })
    })

    it('404 - Discussion not found', function () {
      cy.signIn(u1.email, u1.password)

      cy.req({ url, method: 'PUT', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(404)
        expect(res.body).to.have.property('message', err.DISCUSSION_NOT_FOUND)
      })
    })

    it('403 - Forbidden if the user is not the buyer nor the seller', function () {
      cy.signIn(u2.email, u2.password)

      const url = '/api/discussions/' + this.dId
      cy.req({ url, method: 'PUT', csrfToken: true }).then((res) => {
        expect(res.status).to.eq(403)
        expect(res.body).to.have.property('message', err.FORBIDDEN)
      })
    })

    describe('GET', () => {
      const method = 'GET'

      it('200 - Get the discussion', function () {
        cy.signIn(u1.email, u1.password)

        type Csrf = { csrfToken: string }

        cy.req<Csrf>({ url: '/api/auth/csrf', method }).then((res) => {
          const url = `/api/discussions/${this.dId}?csrfToken=${res.body.csrfToken}`

          cy.req<DiscussionModel>({ url, method }).then((res) => {
            expect(res.status).to.eq(200)
            expect(res.body).to.eql({
              id: this.dId,
              messages: this.d.messages,
              postId: this.d.postId,
              buyerId: this.d.buyerId,
              sellerId: this.d.sellerId,
              postName: this.d.postName,
              channelName: 'private-chat-' + this.d.channelName,
            })
          })
        })
      })
    })

    describe('PUT', () => {
      const method = 'PUT'

      it('422 - Invalid message', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/discussions/' + this.dId

        cy.req({ url, method, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(422)
          expect(res.body).to.have.property('message', err.MESSAGE_REQUIRED)
        })
      })

      it('200 - Message added to the discussion', function () {
        cy.signIn(u1.email, u1.password)

        const body = {
          message: {
            message: "What's up?",
            createdAt: new Date().toISOString(),
            isBuyerMsg: true,
          },
        }

        const url = '/api/discussions/' + this.dId
        cy.req({ url, method, body, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)
        })

        cy.task<DiscussionModel>('getDiscussionByPostId', this.d.postId).then(
          (d) => {
            expect(d.messages[1]).to.include(body.message)
          }
        )
      })
    })

    describe('DELETE', () => {
      const method = 'DELETE'

      it('200 - Discussion deleted', function () {
        cy.signIn(u1.email, u1.password)

        const url = '/api/discussions/' + this.dId

        cy.req({ url, method, csrfToken: true }).then((res) => {
          expect(res.status).to.eq(200)

          cy.task<DiscussionModel>('getDiscussionByPostId', this.d.postId).then(
            (d) => {
              expect(d).not.to.exist
            }
          )
        })
      })
    })
  })
})
