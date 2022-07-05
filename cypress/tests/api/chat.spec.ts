import err from '../../../utils/constants/errors'
import u1 from '../../fixtures/user1.json'
import Pusher from 'pusher-js'
import { MessageSchema } from '../../../schemas/messageSchema'
import { IDiscussion } from '../../../types/common'

type Discussion = Omit<IDiscussion, 'id'>
const d1: Discussion = require('../../fixtures/discussion.json')

const pusherKey = Cypress.env('pusherKey')
const pusherCluster = Cypress.env('pusherCluster')

describe('/api/chat', () => {
  const url = '/api/chat'
  const method = 'POST'
  const body = { message: d1.messages[0], channelName: d1.channelName }

  before(() => {
    cy.task('reset')
    cy.task<string>('addUser', u1).then((id) => {
      cy.wrap(id).as('u1Id')
    })
  })

  it('405 - Method not allowed', function () {
    cy.signIn(u1.email, u1.password)

    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  it('403 - Forbidden', function () {
    cy.req({ url, method, body }).then((res) => {
      expect(res.status).to.eq(403)
      expect(res.body).to.have.property('message', err.FORBIDDEN)
    })
  })

  it('422 - Invalid body', function () {
    cy.signIn(u1.email, u1.password)

    cy.req({ url, method }).then((res) => {
      expect(res.status).to.eq(422)
      expect(res.body).to.have.property('message', err.MESSAGE_REQUIRED)
    })
  })

  it('sends the message back to all clients subscribed to that channel', function () {
    cy.signIn(u1.email, u1.password)

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      channelAuthorization: { endpoint: '/api/pusher/auth', transport: 'ajax' },
    })

    const channel = pusher.subscribe('private-chat-0')

    channel.bind('message', (message: MessageSchema) => {
      expect(message).to.eql({ ...body.message })
    })

    cy.req({ url, method, body }).then((res) => {
      expect(res.status).to.eq(200)
    })
  })
})
