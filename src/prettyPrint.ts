import { chunk } from './chunk'

export function prettyPrintArray<T>(array: T[]): string {
  const chunks = chunk(array, 2)
  const maxKeyLength = Math.max(
    ...chunks.map(([key]) => key.toString().length + 2)
  )

  let output = '[\n'

  for (const [key, value] of chunks) {
    if (typeof key === 'string') {
      const paddedKey = ('"' + key + '"').padEnd(maxKeyLength)
      output += `  ${paddedKey}, `
    }

    if (typeof value === 'number') {
      output += value
    }

    if (typeof value === 'string') {
      output += '"' + value + '"'
    }

    output += ',\n'
  }

  output += ']'
  return output
}
