import _Discussion from 'models/Discussion'
import type { DiscussionDoc } from '..'

export const mockSaveDiscussion = vi.fn()
export const mockFindOneDiscussion = vi.fn()
export const mockFindDiscussionById = vi.fn()
export const mockFindDiscussionByIdAndUpdate = vi.fn()
export const mockDeleteOneDiscussion = vi.fn()
export const mockFindDiscussion = vi.fn()
export const mockUpdateOneDiscussion = vi.fn()

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

  static updateOne(...args: Parameters<(typeof _Discussion)['updateOne']>) {
    return {
      lean: () => ({ exec: async () => mockUpdateOneDiscussion(...args) }),
    }
  }
}
