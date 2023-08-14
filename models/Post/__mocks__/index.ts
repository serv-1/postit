import _Post, { PostDoc } from 'models/Post'

export const mockSavePost = jest.fn()
export const mockFindPostById = jest.fn()
export const mockUpdateOnePost = jest.fn()
export const mockDeleteOnePost = jest.fn()
export const mockAggregate = jest.fn()

export default class Post {
  document: Omit<PostDoc, '_id' | 'discussionIds'>

  constructor(document: Post['document']) {
    this.document = document
  }

  async save() {
    return await mockSavePost(this.document)
  }

  static findById(...args: Parameters<(typeof _Post)['findById']>) {
    return {
      lean: () => ({ exec: async () => mockFindPostById(...args) }),
    }
  }

  static updateOne(...args: Parameters<(typeof _Post)['updateOne']>) {
    return {
      lean: () => ({ exec: async () => mockUpdateOnePost(...args) }),
    }
  }

  static deleteOne(...args: Parameters<(typeof _Post)['deleteOne']>) {
    return {
      lean: () => ({ exec: async () => mockDeleteOnePost(...args) }),
    }
  }

  static aggregate(...args: Parameters<(typeof _Post)['aggregate']>) {
    return {
      exec: async () => mockAggregate(...args),
    }
  }
}
