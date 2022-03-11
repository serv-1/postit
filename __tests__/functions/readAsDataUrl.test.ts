import readAsDataUrl from '../../utils/functions/readAsDataUrl'

it("returns a promise resolving in an object that contain the file's type and base64", async () => {
  const file = new File(['data'], 'text.txt', { type: 'text/plain' })

  const result = await readAsDataUrl(file)

  expect(result).toHaveProperty('ext', 'txt')
  expect(result).toHaveProperty('base64')
})
