import { appendFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import { cwd } from 'process'
import { Buffer } from 'buffer'

interface Options {
	enc?: BufferEncoding
	name?: string
}

/**
 * Create a file with the given data and extension in the given directory.
 * 
 * @param data file data
 * @param ext file extension
 * @param dir path to the directory, relative to the project root
 * @param options { enc: encoding, name: filename }
 * @returns the name (with the extension) of the created file
 */
async function createFile(data: string | Buffer, ext: string, dir: string, options: Options = { enc: 'utf8' }) {
  const filename = (options.name ? options.name : nanoid()) + '.' + ext
  const path = cwd() + dir + filename

  if (Buffer.isBuffer(data)) {
    await appendFile(path, data)
  } else {
    await appendFile(path, Buffer.from(data, options.enc))
  }

  return filename
}

export default createFile
