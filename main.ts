import { moduleRegistry } from './src/moduleManager'
import './src/modules'
import { parseEnv } from './src/parseEnv'

const PORT = parseEnv('PORT', Number) || 8080

function chunk<T>(array: T[], size: number): T[][] {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function prettyPrintArray<T>(array: T[]): string {
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

console.log(`interferer machine`.toLocaleUpperCase())
console.log('-----------------\n')
console.log(`http server: http://localhost:${PORT}`)
console.log(`websocket:   ws://localhost:${PORT}\n`)

console.log(`registered modules: (${moduleRegistry.size})`)
for (const [id] of moduleRegistry) {
  console.log(`- ${id}`)
}

console.log('\n-----------------\n')

Bun.serve({
  port: PORT,

  // websocket server
  websocket: {
    open(ws) {
      console.log('client connected')
    },
    message(ws, message) {
      // TODO: forward message to module
      console.log(message)
    }
  },

  // http server
  fetch(req, server) {
    if (server.upgrade(req)) {
      console.log('upgraded connection to websocket')
      return
    }

    return new Response(
      `interferer machine server running in http://localhost:${PORT}`
    )
  }
})
