import blobToDataUrl from '.'

it('returns the given blob as a data url', async () => {
  const blob = new Blob(['data'], { type: 'text/plain' })
  const dataUrl = await blobToDataUrl(blob)

  expect(dataUrl).toContain('data:text/plain;base64,')
})

it("throws an error if the blob can't be read", async () => {
  const blob = null as unknown as Blob

  await expect(blobToDataUrl(blob)).rejects.toThrow()
})
