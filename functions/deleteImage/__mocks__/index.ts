export const mockDeleteImage = jest.fn()

export default async function deleteImage(key: string) {
  await mockDeleteImage(key)
}
