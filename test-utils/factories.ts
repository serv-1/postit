import { nanoid } from 'nanoid'
import type { Discussion, Message, User, UserDiscussion } from 'types'

export function buildUser(overrides: Partial<User> = {}): User {
  const _id = nanoid()
  return {
    _id,
    name: 'john',
    image: 'john.png',
    email: 'john@test.com',
    postIds: [],
    favPostIds: [],
    discussions: [],
    ...overrides,
  }
}

export function buildUserDiscussion(
  overrides: Partial<UserDiscussion> = {},
): UserDiscussion {
  return {
    _id: nanoid(),
    id: nanoid(),
    hidden: false,
    hasNewMessage: false,
    ...overrides,
  }
}

export function buildDiscussion(
  overrides: Partial<Discussion> = {},
): Discussion {
  const _id = nanoid()
  const buyerId = nanoid()
  return {
    _id,
    post: {
      id: nanoid(),
      name: 'table',
    },
    buyerId,
    sellerId: nanoid(),
    messages: [buildMessage({ userId: buyerId })],
    ...overrides,
  }
}

export function buildMessage(overrides: Partial<Message> = {}): Message {
  return {
    _id: nanoid(),
    userId: nanoid(),
    message: 'yo',
    createdAt: new Date().toString(),
    seen: true,
    ...overrides,
  }
}
