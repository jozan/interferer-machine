import { errorPrinter } from './src/errorPrinter'
import { parseMessage } from './src/messageParser'
import { moduleRegistry } from './src/moduleManager'
import { parseEnv } from './src/parseEnv'

import './src/modules' // this import triggers the module registration
import { setSpaceshipState } from './src/spaceshipStates'
import { bold, faded, green } from './src/term'
import { Router } from './src/router'

// @ts-ignore: Property 'UrlPattern' does not exist
if (!globalThis.URLPattern) {
  await import('urlpattern-polyfill')
}

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

/**
 * Define the HTTP routes
 */
const router = new Router()
router.get('/', () => new Response('hello from new router!'))
router.post('/device/:id', async ({ req, text }) => {
  const deviceId = req.param('id')
  console.log(`received a message from device ${deviceId}:`, await req.text())
  return text(`device id: ${deviceId}`)
})

/**
 * Start the HTTP server
 */
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

  fetch(req, server) {
    // Required for the websocket server to work properly
    if (server.upgrade(req)) {
      console.log('upgraded connection to websocket')
      return
    }

    return router.fetch(req, server)
  }
})
