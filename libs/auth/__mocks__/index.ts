export const mockAuth = jest.fn()
export const mockSignIn = jest.fn()
export const mockSignOut = jest.fn()

export const { auth, signIn, signOut } = {
  auth: mockAuth,
  signIn: mockSignIn,
  signOut: mockSignOut,
}
