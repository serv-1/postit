import _Post, { PostDoc } from 'models/Post'

export const mockSavePost = jest.fn()

export default class Post {
  document: Omit<PostDoc, '_id' | 'discussionIds'>

  constructor(document: Post['document']) {
    this.document = document
  }

  async save() {
    return await mockSavePost(this.document)
  }
}
