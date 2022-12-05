import { errorPrinter } from './src/errorPrinter'
import { parseMessage } from './src/messageParser'
import { moduleRegistry } from './src/moduleManager'
import { parseEnv } from './src/parseEnv'

import './src/modules' // this import triggers the module registration
import { setSpaceshipState } from './src/spaceshipStates'
import { bold, faded, green } from './src/term'

const PORT = parseEnv('PORT', Number) || 8080

console.log(bold(`\ninterferer machine`.toLocaleUpperCase()))
console.log('-----------------\n')
console.log(`${bold('http server:')} http://localhost:${PORT}`)
console.log(`${bold('websocket:')}   ws://localhost:${PORT}\n`)

console.log(bold(`registered modules: (${moduleRegistry.size})`))
for (const [id, mod] of moduleRegistry) {
  const part1 = `${bold(id)}`
  const part2 = faded(`(${mod.subscribesTo.length} subscriptions)`)
  const part3 = green(`[${mod.subscribesTo.join(', ')}]`)

  console.log(`    - ${part1} ${part2}\n      ${part3}`)
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

      const {
        value: { callsign, ...spaceshipState }
      } = parsedMessage
      console.log({ callsign, ...spaceshipState })

      const diff = setSpaceshipState(callsign, spaceshipState)
      console.log('diff:', diff)

      if (!diff) {
        return
      }

      for (const [_id, mod] of moduleRegistry) {
        const payload = mod.selector(diff)
        if (payload) {
          mod.listener(payload)
        }
      }
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
