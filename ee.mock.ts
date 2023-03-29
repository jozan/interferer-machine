import { parseEnv } from "./src/parseEnv"
import { createLogger } from "./src/term"

const logger = createLogger("EE CLIENT")

const data = ["callsign", "Earthship Sagan", "hull", 250.0, "shieldsActive", 0]

function pickRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateData() {
  const callsign = pickRandom(["Earthship Sagan", "Moonship Hawking"])
  const hull = Math.random() * 1000
  const shieldsActive = Math.random() > 0.5 ? 1 : 0

  return ["callsign", callsign, "hull", hull, "shieldsActive", shieldsActive]
}

const PORT = parseEnv("PORT", Number) || 8080
const INTERVAL = parseEnv("INTERVAL", Number) || 1000

logger("Empty Epsilon mock game client started!")

const internalState = {
  clients: 0,
}

const CHANNEL_ID = "broadcast"

type WebSocketData = {
  createdAt: number
}

const server = Bun.serve<WebSocketData>({
  port: PORT,
  fetch(req, server) {
    if (
      server.upgrade(req, {
        data: {
          createdAt: Date.now(),
        },
      })
    ) {
      return
    }

    return new Response("[EE CLIENT]: Empty Epsilon mock game client")
  },

  websocket: {
    message(ws, message) {
      logger("Received message:", message.toString())
    },
    open(ws) {
      internalState.clients++
      logger("Client connected", `(${internalState.clients} total)`)
      ws.subscribe(CHANNEL_ID)
    },
    close(ws, code, message) {
      internalState.clients--
      logger("Client disconnected", `(${internalState.clients} total)`)
      ws.unsubscribe(CHANNEL_ID)
    },
    drain(ws) {
      logger("socket drained")
    },
  },

  error(error: Error) {
    return new Response("[EE CLIENT]: Uh oh!!\n" + error.toString(), {
      status: 500,
    })
  },
})

;(function broadcastGameState(prevTick: number = 0) {
  const now = performance.now()
  const delay = INTERVAL - ((now - prevTick) % INTERVAL)
  const nextTick = now + delay

  const data = JSON.stringify(generateData())

  logger("Broadcasting data:", data)
  server.publish(CHANNEL_ID, data)

  setTimeout(() => broadcastGameState(nextTick), delay)
})(performance.now() + INTERVAL)
