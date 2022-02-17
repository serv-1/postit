import { access, readFile, unlink } from 'fs/promises'
import { cwd } from 'process'
import createFile from '../../utils/functions/createFile'

const dir = '/public/static/'

describe('returns the name of the created file', () => {
  test('with string data', async () => {
    const fname = await createFile('file data', 'txt', dir)

    expect(await access(cwd() + dir + fname)).toBeUndefined()

    await unlink(cwd() + dir + fname)
  })

  test('with string data and an encoding', async () => {
    const fileData = Buffer.from('file data', 'base64').toString('base64')
    const fname = await createFile(fileData, 'txt', dir)

    const data = await readFile(cwd() + dir + fname, 'base64')

    expect(data).not.toBe('file data')

    await unlink(cwd() + dir + fname)
  })

  test('with Buffer data', async () => {
    const fname = await createFile(Buffer.from('file data'), 'txt', dir)

    expect(await access(cwd() + dir + fname)).toBeUndefined()

    await unlink(cwd() + dir + fname)
  })
})
