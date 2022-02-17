import { access, readFile, unlink } from 'fs/promises'
import { cwd } from 'process'
import createFile from '../../utils/functions/createFile'

describe('returns the name of the created file', () => {
  test('with string data', async () => {
    const fname = await createFile('file data', 'txt', '/static/')

    expect(await access(cwd() + '/public/static/' + fname)).toBeUndefined()

    await unlink(cwd() + '/public/static/' + fname)
  })

  test('with string data and an encoding', async () => {
    const fileData = Buffer.from('file data', 'base64').toString('base64')
    const fname = await createFile(fileData, 'txt', '/static/')

    const data = await readFile(cwd() + '/public/static/' + fname, 'base64')

    expect(data).not.toBe('file data')

    await unlink(cwd() + '/public/static/' + fname)
  })

  test('with Buffer data', async () => {
    const fname = await createFile(Buffer.from('file data'), 'txt', '/static/')

    expect(await access(cwd() + '/public/static/' + fname)).toBeUndefined()

    await unlink(cwd() + '/public/static/' + fname)
  })
})
