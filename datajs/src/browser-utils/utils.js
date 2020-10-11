import { Readable } from 'stream'
// import { File } from '../file-base'

/**
 * Return node like stream so that parsers work.
 * Transform browser's Reader to string, then create a nodejs stream from it
 * @param {object} reader
 * @param {number} size
 */
export async function toNodeStream(reader, size) {
  // if in browser, return node like stream so that parsers work
  // Running in browser:
  const nodeStream = new Readable()

  let lineCounter = 0
  let lastString = ''
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()

    if (done || (lineCounter > size && size !== 0)) {
      reader.cancel()
      break
    }

    // Decode the current chunk to string and prepend the last string
    const string = `${lastString}${decoder.decode(value)}`

    // Extract lines from chunk
    const lines = string.split(/\r\n|[\r\n]/g)

    // Save last line, as it might be incomplete
    lastString = lines.pop() || ''

    for (const line of lines) {
      if (lineCounter === size) break
      // Write each string line to our nodejs stream
      nodeStream.push(line + '\r\n')
      lineCounter++
    }
  }

  nodeStream.push(null)
  return nodeStream
}

export function isFileFromBrowser(file) {
  return file instanceof File
}
