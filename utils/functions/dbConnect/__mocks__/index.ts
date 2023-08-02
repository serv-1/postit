export const mockDbConnect = jest.fn()

export default async function dbConnect() {
  await mockDbConnect()
}
