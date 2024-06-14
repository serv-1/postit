/**
 * @jest-environment node
 */

import { Types } from 'mongoose'
import formatDiscussionForClient from '.'

it('returns the discussion formatted to be sent to the client', () => {
  const discussionId = new Types.ObjectId(0)
  const postId = new Types.ObjectId(1)
  const buyerId = new Types.ObjectId(2)
  const sellerId = new Types.ObjectId(3)

  expect(
    formatDiscussionForClient(
      {
        _id: discussionId,
        postId,
        postName: 'table',
        channelName: 'chanName',
        messages: [],
        buyerId,
        sellerId,
      },
      {
        _id: buyerId,
        name: 'john',
        image: 'john.jpg',
        email: 'john@test.com',
        postIds: [],
        favPostIds: [],
        discussions: [],
        channelName: 'johnChanName',
      },
      {
        _id: sellerId,
        name: 'jane',
        image: 'jane.jpg',
        email: 'jane@test.com',
        postIds: [],
        favPostIds: [],
        discussions: [],
        channelName: 'janeChanName',
      },
      false
    )
  ).toEqual({
    id: discussionId,
    postId,
    postName: 'table',
    channelName: 'chanName',
    messages: [],
    buyer: {
      id: buyerId,
      name: 'john',
      image: 'john.jpg',
    },
    seller: {
      id: sellerId,
      name: 'jane',
      image: 'jane.jpg',
    },
    hasNewMessage: false,
  })
})

it('returns the discussion formatted for client without the buyer', () => {
  const discussionId = new Types.ObjectId(0)
  const postId = new Types.ObjectId(1)
  const sellerId = new Types.ObjectId(3)

  expect(
    formatDiscussionForClient(
      {
        _id: discussionId,
        postId,
        postName: 'table',
        channelName: 'chanName',
        messages: [],
        sellerId,
      },
      null,
      {
        _id: sellerId,
        name: 'jane',
        image: 'jane.jpg',
        email: 'jane@test.com',
        postIds: [],
        favPostIds: [],
        discussions: [],
        channelName: 'janeChanName',
      },
      false
    )
  ).toEqual({
    id: discussionId,
    postId,
    postName: 'table',
    channelName: 'chanName',
    messages: [],
    buyer: { name: '[DELETED]' },
    seller: {
      id: sellerId,
      name: 'jane',
      image: 'jane.jpg',
    },
    hasNewMessage: false,
  })
})

it('returns the discussion formatted for client without the seller', () => {
  const discussionId = new Types.ObjectId(0)
  const postId = new Types.ObjectId(1)
  const buyerId = new Types.ObjectId(2)

  expect(
    formatDiscussionForClient(
      {
        _id: discussionId,
        postId,
        postName: 'table',
        channelName: 'chanName',
        messages: [],
        buyerId,
      },
      {
        _id: buyerId,
        name: 'john',
        image: 'john.jpg',
        email: 'john@test.com',
        postIds: [],
        favPostIds: [],
        discussions: [],
        channelName: 'johnChanName',
      },
      null,
      false
    )
  ).toEqual({
    id: discussionId,
    postId,
    postName: 'table',
    channelName: 'chanName',
    messages: [],
    buyer: {
      id: buyerId,
      name: 'john',
      image: 'john.jpg',
    },
    seller: { name: '[DELETED]' },
    hasNewMessage: false,
  })
})
