import { access, readFile, unlink } from 'fs/promises'
import { cwd } from 'process'
import createFile from '../../utils/functions/createFile'

const dir = '/public/static/'

describe('returns the name of the file created with', () => {
  test('string data', async () => {
    const fname = await createFile('file data', 'txt', dir)

    expect(await access(cwd() + dir + fname)).toBeUndefined()

    await unlink(cwd() + dir + fname)
  })

  test('buffer data', async () => {
    const fname = await createFile(Buffer.from('file data'), 'txt', dir)

    expect(await access(cwd() + dir + fname)).toBeUndefined()

    await unlink(cwd() + dir + fname)
  })

  test('string data and an encoding', async () => {
    const fname = await createFile('file data', 'txt', dir, { enc: 'base64' })

    const data = await readFile(cwd() + dir + fname, 'base64')

    expect(data).not.toBe('file data')

    await unlink(cwd() + dir + fname)
  })

  test('a custom name', async () => {
    const fname = await createFile('file data', 'txt', dir, { name: 'hello' })

    expect(fname).toBe('hello.txt')
    expect(await access(cwd() + dir + fname)).toBeUndefined()

    await unlink(cwd() + dir + fname)
  })
})
