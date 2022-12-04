import { parseEnv } from './src/parseEnv'

const data = ['callsign', 'Earthship Sagan', 'hull', 250.0, 'shieldsActive', 0]

const PORT = parseEnv('PORT', Number) || 8080
const WEBSOCKET_URL =
  parseEnv('WEBSOCKET_URL', (value) => {
    if (!value.startsWith('ws://')) {
      throw new Error('Invalid websocket URL')
    }
    return value
  }) || 'ws://127.0.0.1:8080'

console.log('Empty Epsilon mock server started!')

// connect to the websocket server
// try to reconnect if the connection is lost
const ws = new WebSocket(WEBSOCKET_URL)

ws.addEventListener('message', (e) => {
  const message = JSON.parse(e.data)
  console.log('[EE MOCK]: Received message:', message)
})

ws.addEventListener('open', (e) => {
  console.log(`[EE MOCK]: Connected to the websocket server: ${ws.url}`)
})

ws.addEventListener('error', (e) => {
  console.log('[EE MOCK]: Error:', e)
})

ws.addEventListener('close', (e) => {
  console.log('[EE MOCK]: Disconnected from the websocket server')
})

// open up the server so mock process is long lived
Bun.serve({
  port: PORT,
  fetch(req) {
    return new Response('Empty Epsilon mock server is running')
  },
  error(error: Error) {
    return new Response('Uh oh!!\n' + error.toString(), { status: 500 })
  },
  websocket: {
    close(ws) {
      console.log('Server: Client disconnected')
    },
    open(ws) {
      console.log('Server: Client connected')
    },
    message(ws, message) {
      console.log(message)
    }
  }
})
