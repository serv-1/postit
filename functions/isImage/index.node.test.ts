import isImage from '.'

it("returns false if the file isn't an image", () => {
  expect(isImage(new File(['data'], 'text.txt', { type: 'text/plain' }))).toBe(
    false
  )
})

it('returns true if the file is a jpeg', () => {
  expect(isImage(new File(['data'], 'img.jpeg', { type: 'image/jpeg' }))).toBe(
    true
  )
})

it('returns true if the file is a png', () => {
  expect(isImage(new File(['data'], 'img.png', { type: 'image/png' }))).toBe(
    true
  )
})

it('returns true if the file is a gif', () => {
  expect(isImage(new File(['data'], 'img.gif', { type: 'image/gif' }))).toBe(
    true
  )
})
