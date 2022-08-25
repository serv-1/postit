import { signOut } from 'next-auth/react'
import { DiscussionModel } from '../../../../models/Discussion'
import { UserModel } from '../../../../models/User'
import {
  DeferredPromise,
  JSONDiscussion,
  UnArray,
} from '../../../../types/common'
import err from '../../../../utils/constants/errors'
import getClientPusher from '../../../../utils/functions/getClientPusher'
import u1 from '../../../fixtures/user1.json'
import u2 from '../../../fixtures/user2.json'

type Csrf = { csrfToken: string }
type JSONMessage = UnArray<JSONDiscussion['messages']>

const url = '/api/discussions/f0f0f0f0f0f0f0f0f0f0f0f0'

describe('/api/discussions/{id}', () => {
  beforeEach(() => {
    cy.task('reset')
    const seller = { ...u2, image: 'seller.jpg' }
    cy.task<string>('addUsers', JSON.stringify([u1, seller])).then((ids) => {
      cy.wrap(ids[0]).as('u1Id')
      cy.wrap(ids[1]).as('u2Id')
    })
  })

  describe('', () => {
    it('405 - Method not allowed', function () {
      cy.signIn(u1.email, u1.password)

      const discussion = {
        messages: [{ message: 'yo', userId: this.u1Id }],
        postName: 'table',
        postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
        buyerId: this.u1Id,
        sellerId: this.u2Id,
      }

      cy.task<string>('addDiscussion', discussion).then((id) => {
        const url = '/api/discussions/' + id

        cy.req({ url, method: 'PATCH', csrfToken: true }).then((res) => {
          expect(res.status).to.eq(405)
          expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
        })
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

      const discussion = {
        messages: [{ message: 'yo', userId: this.u1Id }],
        postName: 'table',
        postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
        buyerId: this.u1Id,
        sellerId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
      }

      cy.task<string>('addDiscussion', discussion).then((id) => {
        const url = '/api/discussions/' + id
        cy.req({ url, method: 'PUT', csrfToken: true }).then((res) => {
          expect(res.status).to.eq(403)
          expect(res.body).to.have.property('message', err.FORBIDDEN)
        })
      })
    })

    describe('GET', () => {
      const method = 'GET'

      it('200 - Get the discussion (with a seller)', function () {
        cy.signIn(u1.email, u1.password)

        const discussion = {
          messages: [{ message: 'yo', userId: this.u1Id }],
          postName: 'table',
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
          sellerId: this.u2Id,
        }

        cy.task<string>('addDiscussion', discussion).then((id) => {
          cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
            cy.req<Csrf>({ url: '/api/auth/csrf', method }).then((res) => {
              const url = `/api/discussions/${id}?csrfToken=${res.body.csrfToken}`

              cy.req<DiscussionModel>({ url, method }).then((res) => {
                expect(res.status).to.eq(200)

                cy.task<UserModel>('getUser', this.u1Id).then((u1) => {
                  cy.task<UserModel>('getUser', this.u2Id).then((u2) => {
                    expect(res.body).to.eql({
                      id,
                      messages: [
                        {
                          message: d.messages[0].message,
                          createdAt: d.messages[0].createdAt,
                          userId: d.messages[0].userId,
                          seen: false,
                        },
                      ],
                      postId: d.postId,
                      buyer: {
                        id: d.buyerId,
                        name: u1.name,
                        image: '/static/images/' + u1.image,
                      },
                      seller: {
                        id: d.sellerId,
                        name: u2.name,
                        image: '/static/images/users/' + u2.image,
                      },
                      postName: d.postName,
                      channelName: 'private-encrypted-' + d.channelName,
                    })
                  })
                })
              })
            })
          })
        })
      })

      it('200 - Get the discussion (without a seller)', function () {
        cy.signIn(u1.email, u1.password)

        const discussion = {
          messages: [{ message: 'yo', userId: this.u1Id }],
          postName: 'table',
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
        }

        cy.task<string>('addDiscussion', discussion).then((id) => {
          cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
            cy.req<Csrf>({ url: '/api/auth/csrf', method }).then((res) => {
              const url = `/api/discussions/${id}?csrfToken=${res.body.csrfToken}`

              cy.req<DiscussionModel>({ url, method }).then((res) => {
                expect(res.status).to.eq(200)

                cy.task<UserModel>('getUser', this.u1Id).then((u1) => {
                  expect(res.body).to.deep.include({
                    buyer: {
                      id: this.u1Id,
                      name: u1.name,
                      image: '/static/images/' + u1.image,
                    },
                    seller: {
                      name: '[DELETED]',
                      image: '/static/images/default.jpg',
                    },
                  })
                })
              })
            })
          })
        })
      })
    })

    describe('PUT', () => {
      const method = 'PUT'

      it('422 - Invalid message', function () {
        cy.signIn(u1.email, u1.password)

        const discussion = {
          messages: [{ message: 'yo', userId: this.u1Id }],
          postName: 'table',
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
          sellerId: this.u2Id,
        }

        cy.task<string>('addDiscussion', discussion).then((id) => {
          const url = '/api/discussions/' + id
          const body = { message: 1 }

          cy.req({ url, method, body, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(422)
            expect(res.body).to.have.property('message', err.MESSAGE_INVALID)
          })
        })
      })

      // Cannot send a message if the interlocutor has deleted its account or if it does not have the discussion id anymore
      it('400 - Cannot send a message if the interlocutor has deleted its account', function () {
        const d1 = {
          messages: [{ message: 'yo', userId: this.u1Id }],
          postName: 'table',
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
        }

        cy.task<string>('addDiscussion', d1).then((id) => {
          cy.signIn(u1.email, u1.password)

          const url = '/api/discussions/' + id
          cy.req({ url, method, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(400)
            expect(res.body).to.have.property('message', err.CANNOT_SEND_MSG)
          })
        })

        // const u3 = { name: 'Bob', email: 'bob@bo.b', password: 'bobobobobob' }

        // cy.task<string>('addUser', u3).then((u3Id) => {
        //   const d2 = { ...d1, sellerId: u3Id }

        //   cy.task<string>('addDiscussion', d2).then((d2Id) => {
        //     signOut({ redirect: false })
        //     cy.signIn(u3.email, u3.password)

        //     let url = '/api/user/'
        //     const body = { discussionId: d2Id }

        //     cy.req({ url, method: 'PUT', body, csrfToken: true }).then(
        //       (res) => {
        //         expect(res.status).to.eq(200)
        //       }
        //     )

        //     signOut({ redirect: false })
        //     cy.signIn(u1.email, u1.password)

        //     url = '/api/discussions/' + d2Id
        //     cy.req({ url, method, csrfToken: true }).then((res) => {
        //       expect(res.status).to.eq(400)
        //       expect(res.body).to.have.property('message', err.CANNOT_SEND_MSG)
        //     })
        //   })
        // })
      })

      describe('Adding a message to the discussion', function () {
        it('200 - Message added to the discussion', function () {
          cy.signIn(u2.email, u2.password)

          const pusher = getClientPusher()
          const body = { message: "What's up?" }
          const discussion = {
            messages: [{ message: 'yo', userId: this.u1Id }],
            postName: 'table',
            postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
            buyerId: this.u1Id,
            sellerId: this.u2Id,
          }

          cy.task<string>('addDiscussion', discussion).then((id) => {
            cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
              let uDeferred: DeferredPromise<string> | null = null
              let dDeferred: DeferredPromise<JSONMessage> | null = null

              const uPromise = new Promise<string>((resolve, reject) => {
                uDeferred = { resolve, reject }
              })
              const dPromise = new Promise<JSONMessage>((resolve, reject) => {
                dDeferred = { resolve, reject }
              })

              cy.task<UserModel>('getUser', this.u1Id).then((u) => {
                const uChannel = pusher.subscribe('private-' + u.channelName)
                const dChannel = pusher.subscribe(
                  'private-encrypted-' + d.channelName
                )

                uChannel.bind('new-message', () =>
                  uDeferred?.resolve('resolved')
                )
                dChannel.bind('new-message', (msg: JSONMessage) =>
                  dDeferred?.resolve(msg)
                )
              })

              const url = '/api/discussions/' + id
              cy.req({ url, method, body, csrfToken: true }).then((res) => {
                expect(res.status).to.eq(200)
              })

              cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
                expect(d.messages[1]).to.have.property('message', body.message)
                expect(d.messages[1]).to.have.property('userId', this.u2Id)
                expect(d.messages[1]).to.have.property('seen', false)
                expect(d.messages[1]).to.have.property('createdAt')

                cy.task<UserModel>('getUser', this.u1Id).then((u) => {
                  expect(u.hasUnseenMessages).to.eq(true)
                })
              })

              uPromise.then((data) => expect(data).to.be('resolved'))
              dPromise.then((msg) => {
                expect(msg).to.include(body.message)
                expect(msg).to.have.property('createdAt')
                expect(msg).to.have.property('seen', false)
                expect(msg).not.to.have.property('_id')
              })

              pusher.disconnect()
            })
          })
        })
      })

      describe('Seeing the last unseen message', function () {
        it('200 - Last messages seen', function () {
          const discussion = {
            messages: [
              { message: 'yo', userId: this.u1Id },
              { message: "what's up?", userId: this.u1Id },
            ],
            postName: 'table',
            postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
            buyerId: this.u1Id,
            sellerId: this.u2Id,
          }

          cy.task<string>('addDiscussion', discussion).then((id) => {
            cy.signIn(u2.email, u2.password)

            cy.task<UserModel>('getUser', this.u2Id).then((u) => {
              expect(u.hasUnseenMessages).to.eq(true)
            })

            const url = '/api/discussions/' + id

            cy.req({ url, method, csrfToken: true }).then((res) => {
              expect(res.status).to.eq(200)
            })

            cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
              expect(d.messages[0]).to.have.property('seen', true)
              expect(d.messages[1]).to.have.property('seen', true)

              cy.task<UserModel>('getUser', this.u2Id).then((u) => {
                expect(u.hasUnseenMessages).to.eq(false)
              })
            })

            const body = { message: 'yo' }
            cy.req({ url, method, body, csrfToken: true }).then((res) => {
              expect(res.status).to.eq(200)
            })

            cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
              expect(d.messages[0]).to.have.property('seen', true)
              expect(d.messages[1]).to.have.property('seen', true)
              expect(d.messages[2]).to.have.property('seen', false)

              cy.task<UserModel>('getUser', this.u1Id).then((u) => {
                expect(u.hasUnseenMessages).to.eq(true)
              })
            })

            signOut({ redirect: false })
            cy.signIn(u1.email, u1.password)

            cy.req({ url, method, csrfToken: true }).then((res) => {
              expect(res.status).to.eq(200)
            })

            cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
              expect(d.messages[0]).to.have.property('seen', true)
              expect(d.messages[1]).to.have.property('seen', true)
              expect(d.messages[2]).to.have.property('seen', true)

              cy.task<UserModel>('getUser', this.u1Id).then((u) => {
                expect(u.hasUnseenMessages).to.eq(false)
              })
            })
          })
        })

        it('200 - does not update hasUnseenMessages field if the user has unseen messages in other discussions', function () {
          const discussion1 = {
            messages: [{ message: 'yo', userId: this.u1Id }],
            postName: 'table',
            postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
            buyerId: this.u1Id,
            sellerId: this.u2Id,
          }
          const discussion2 = {
            ...discussion1,
            postId: 'f1f1f1f1f1f1f1f1f1f1f1f1',
          }

          cy.task<string>('addDiscussion', discussion1).then((d1Id) => {
            cy.task<string>('addDiscussion', discussion2).then((d2Id) => {
              cy.signIn(u2.email, u2.password)

              const url = '/api/discussions/' + d1Id
              cy.req({ url, method, csrfToken: true }).then((res) => {
                expect(res.status).to.eq(200)
              })

              cy.task<UserModel>('getUser', this.u2Id).then((u) => {
                expect(u.hasUnseenMessages).to.eq(true)
              })
            })
          })
        })
      })
    })

    describe('DELETE', () => {
      const method = 'DELETE'

      it('200 - Discussion deleted', function () {
        cy.signIn(u1.email, u1.password)

        const discussion = {
          messages: [{ message: 'yo', userId: this.u1Id }],
          postName: 'table',
          postId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
          buyerId: this.u1Id,
          sellerId: this.u2Id,
        }

        cy.task<string>('addDiscussion', discussion).then((id) => {
          const url = '/api/discussions/' + id

          cy.req({ url, method, csrfToken: true }).then((res) => {
            expect(res.status).to.eq(200)

            cy.task<DiscussionModel>('getDiscussion', id).then((d) => {
              expect(d).not.to.exist
            })
          })
        })
      })
    })
  })
})
