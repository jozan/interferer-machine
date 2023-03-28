import "./src/polyfills"
import { errorPrinter } from "./src/errorPrinter"
import { parseMessage } from "./src/messageParser"
import { moduleRegistry } from "./src/moduleManager"
import { parseEnv } from "./src/parseEnv"

import "./src/modules" // this import triggers the module registration
import { setSpaceshipState } from "./src/spaceshipStates"
import { bold, createLogger, faded, green } from "./src/term"
import { Router } from "./src/router"
import { render } from "./src/pageRenderer"
import { Index } from "./src/pages"

const logger = createLogger("INTERFERER")

const PORT = parseEnv("PORT", Number) || 8080

const EE_CLIENT_WS =
  parseEnv("EE_CLIENT_WS", (value) => {
    if (!value.startsWith("ws://")) {
      throw new Error("Invalid websocket URL")
    }
    return value
  }) || "ws://127.0.0.1:8080"

/**
 * Start up message
 */
console.log(bold(`\ninterferer machine`.toLocaleUpperCase()))
console.log("-----------------\n")
console.log(`${bold("http server:")} http://localhost:${PORT}`)
console.log(`${bold("websocket:")}   ws://localhost:${PORT}\n`)

console.log(bold(`registered modules: (${moduleRegistry.size})`))
for (const [id, mod] of moduleRegistry) {
  const part1 = `${bold(id)}`
  const part2 = faded(`(${mod.subscribesTo.length} subscriptions)`)
  const part3 = green(`[${mod.subscribesTo.join(", ")}]`)

  console.log(`    - ${part1} ${part2}\n      ${part3}`)
}

console.log("\n-----------------\n")
// end startup message

/**
 * Define the HTTP routes
 */
const router = new Router()
router.get(
  "/",
  async () => new Response(await render(<Index />), { status: 200 }),
)
router.post("/device/:id", async ({ req, text, server }) => {
  const deviceId = req.param("id")
  logger(`a message from device '${deviceId}':`, await req.text())
  return text(`device id: ${deviceId}`)
})

const wsInternalState = {
  reconnectCounter: 1,
}

function connectWebSocket() {
  logger("connecting to websocket server...")
  const ws = new WebSocket(EE_CLIENT_WS)

  ws.addEventListener("message", (e) => {
    if (typeof e.data !== "string") {
      logger.error("invalid wsMessage type: Uint8Array")
      return
    }

    const parsedMessage = parseMessage(e.data)
    if (!parsedMessage.ok) {
      errorPrinter("invalid message:", parsedMessage.errors)
      return
    }

    const {
      value: { callsign, ...spaceshipState },
    } = parsedMessage
    logger("received:", JSON.stringify({ callsign, ...spaceshipState }))

    const diff = setSpaceshipState(callsign, spaceshipState)
    logger("diff:", JSON.stringify(diff))

    if (!diff) {
      return
    }

    for (const [_id, mod] of moduleRegistry) {
      const payload = mod.selector(diff)
      if (payload) {
        mod.listener(payload)
      }
    }
  })

  ws.addEventListener("open", (e) => {
    logger(`Connected to the websocket server: ${ws.url}`)
    wsInternalState.reconnectCounter = 1
  })

  ws.addEventListener("error", (e) => {
    console.error("WS error:", e)
  })

  ws.addEventListener("close", (e) => {
    if (wsInternalState.reconnectCounter === 1) {
      logger("Disconnected from the websocket server")
    }

    setTimeout(
      () => {
        logger(`Reconnect attempt ${wsInternalState.reconnectCounter}`)
        wsInternalState.reconnectCounter += 1
        connectWebSocket()
      },
      wsInternalState.reconnectCounter <= 5 ? 1000 : 10000,
    )
  })
}

connectWebSocket()

/**
 * Start the HTTP server
 */
Bun.serve({
  port: PORT,

  fetch(req, server) {
    // Required for the websocket server to work properly
    if (server.upgrade(req)) {
      logger("upgraded connection to websocket")
      return
    }

    return router.fetch(req, server)
  },
})
