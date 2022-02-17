import { appendFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import { cwd } from 'process'
import { Buffer } from 'buffer'

/**
 * Create a file with the given data and extension in the given directory.
 * 
 * @param data file data
 * @param ext file extension
 * @param dir path to the directory, relative to the project root
 * @param encoding data encoding if data is a string, "utf8" by default
 * @returns the name (with extension) of the created file
 */
async function createFile(data: Buffer, ext: string, dir: string): Promise<string>
async function createFile(data: string, ext: string, dir: string, encoding?: BufferEncoding): Promise<string>
async function createFile(data: string | Buffer, ext: string, dir: string, encoding: BufferEncoding = 'utf8') {
  const filename = nanoid() + '.' + ext
  const path = cwd() + dir + filename

  if (Buffer.isBuffer(data)) {
    await appendFile(path, data)
  } else {
    await appendFile(path, Buffer.from(data, encoding))
  }

  return filename
}

export default createFile
