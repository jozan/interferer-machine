import { errorPrinter } from './src/errorPrinter'
import { parseMessage } from './src/messageParser'
import { moduleRegistry } from './src/moduleManager'
import { parseEnv } from './src/parseEnv'

import './src/modules' // this import triggers the module registration

const PORT = parseEnv('PORT', Number) || 8080

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
    message(ws, wsMessage) {
      if (typeof wsMessage !== 'string') {
        console.error('invalid wsMessage type: Uint8Array')
        return
      }

      const parsedMessage = parseMessage(wsMessage)
      if (!parsedMessage.ok) {
        errorPrinter('invalid message:', parsedMessage.errors)
        return
      }

      const { value } = parsedMessage
      console.log(value)

      // TODO: forward message to module
      // ..........
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
