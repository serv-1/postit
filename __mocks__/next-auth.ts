export const mockGetServerSession = jest.fn()

export async function getServerSession() {
  return await mockGetServerSession()
}
