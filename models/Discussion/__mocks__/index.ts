import _Discussion from 'models/Discussion'
import { DiscussionDoc } from '..'

export const mockSaveDiscussion = jest.fn()
export const mockFindOneDiscussion = jest.fn()
export const mockFindDiscussionById = jest.fn()
export const mockFindDiscussionByIdAndUpdate = jest.fn()
export const mockDeleteOneDiscussion = jest.fn()
export const mockFindDiscussion = jest.fn()

export default class Discussion {
  document: Omit<DiscussionDoc, '_id' | 'channelName'>

  constructor(document: Discussion['document']) {
    this.document = document
  }

  async save() {
    return mockSaveDiscussion(this.document)
  }

  static find(...args: Parameters<(typeof _Discussion)['find']>) {
    return {
      lean: () => ({ exec: async () => mockFindDiscussion(...args) }),
    }
  }

  static findOne(...args: Parameters<(typeof _Discussion)['findOne']>) {
    return {
      lean: () => ({ exec: async () => mockFindOneDiscussion(...args) }),
    }
  }

  static findById(...args: Parameters<(typeof _Discussion)['findById']>) {
    return {
      lean: () => ({ exec: async () => mockFindDiscussionById(...args) }),
    }
  }

  static findByIdAndUpdate(
    ...args: Parameters<(typeof _Discussion)['findByIdAndUpdate']>
  ) {
    return {
      lean: () => ({
        exec: async () => mockFindDiscussionByIdAndUpdate(...args),
      }),
    }
  }

  static deleteOne(...args: Parameters<(typeof _Discussion)['deleteOne']>) {
    return {
      lean: () => ({ exec: async () => mockDeleteOneDiscussion(...args) }),
    }
  }
}
