import _User from 'models/User'
import type { CreateUser } from 'schemas/createUser'

export const mockSaveUser = vi.fn()
export const mockUpdateOneUser = vi.fn()
export const mockFindUserById = vi.fn()
export const mockFindUserByIdAndUpdate = vi.fn()
export const mockDeleteOneUser = vi.fn()
export const mockFindOneUser = vi.fn()

export default class User {
  document: CreateUser

  constructor(document: CreateUser) {
    this.document = document
  }

  async save() {
    return await mockSaveUser(this.document)
  }

  static updateOne(...args: Parameters<(typeof _User)['updateOne']>) {
    return {
      lean: () => ({ exec: async () => mockUpdateOneUser(...args) }),
    }
  }

  static findById(...args: Parameters<(typeof _User)['findById']>) {
    return {
      lean: () => ({ exec: async () => mockFindUserById(...args) }),
    }
  }

  static findByIdAndUpdate(
    ...args: Parameters<(typeof _User)['findByIdAndUpdate']>
  ) {
    return {
      lean: () => ({ exec: async () => mockFindUserByIdAndUpdate(...args) }),
    }
  }

  static deleteOne(...args: Parameters<(typeof _User)['deleteOne']>) {
    return {
      lean: () => ({ exec: async () => mockDeleteOneUser(...args) }),
    }
  }

  static findOne(...args: Parameters<(typeof _User)['findOne']>) {
    return {
      lean: () => ({ exec: async () => mockFindOneUser(...args) }),
    }
  }
}
