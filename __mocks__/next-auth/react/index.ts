import type { UseSessionOptions } from 'next-auth/lib/client'
import type { ProviderId } from 'next-auth/providers'
import type { SignInOptions, SignOutParams } from 'next-auth/react'

export const mockSignIn = jest.fn()
export const mockSignOut = jest.fn()
export const mockUseSession = jest.fn()
export const mockGetCsrfToken = jest.fn()

export const signIn = async (id: ProviderId, options?: SignInOptions) => {
  return await mockSignIn(id, options)
}

export const signOut = async (options?: SignOutParams) => {
  return await mockSignOut(options)
}

export const useSession = <R extends boolean>(
  options?: UseSessionOptions<R>
) => {
  return mockUseSession(options)
}

export const getCsrfToken = async () => {
  return await mockGetCsrfToken()
}
