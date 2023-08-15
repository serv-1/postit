import _Discussion from 'models/Discussion'
import { DiscussionDoc } from '..'

export const mockSaveDiscussion = jest.fn()
export const mockFindOneDiscussion = jest.fn()

export default class Discussion {
  document: Omit<DiscussionDoc, '_id' | 'channelName'>

  constructor(document: Discussion['document']) {
    this.document = document
  }

  async save() {
    return mockSaveDiscussion(this.document)
  }

  static findOne(...args: Parameters<(typeof _Discussion)['findOne']>) {
    return {
      lean: () => ({ exec: async () => mockFindOneDiscussion(...args) }),
    }
  }
}
