import _User from 'models/User'
import { AddUserSchema } from 'schemas/addUserSchema'

export const mockSaveUser = jest.fn()
export const mockUpdateOneUser = jest.fn()
export const mockFindUserById = jest.fn()
export const mockDeleteOneUser = jest.fn()
export const mockFindOneUser = jest.fn()

export default class User {
  document: AddUserSchema

  constructor(document: AddUserSchema) {
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
