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

function connectWebSocket() {
  console.log('[EE MOCK] connecting to websocket server...')
  const ws = new WebSocket(WEBSOCKET_URL)

  ws.addEventListener('message', (e) => {
    const message = JSON.parse(e.data)
    console.log('[EE MOCK]: Received message:', message)
  })

  ws.addEventListener('open', (e) => {
    console.log(`[EE MOCK]: Connected to the websocket server: ${ws.url}`)
    sendData()
  })

  ws.addEventListener('error', (e) => {
    console.log('[EE MOCK]: Error:', e)
  })

  ws.addEventListener('close', (e) => {
    console.log('[EE MOCK]: Disconnected from the websocket server')
    setTimeout(() => {
      console.log('[EE MOCK]: Reconnecting to websocket server...')
      connectWebSocket()
    }, 1000)
  })

  function sendData() {
    ws.send(JSON.stringify(data))
    setTimeout(sendData, 1000)
  }
}

connectWebSocket()

// open up the server so mock process is long lived
console.log('[EE MOCK]: Empty Epsilon mock server started!')
Bun.serve({
  port: PORT,
  fetch(req) {
    return new Response('[EE MOCK]: Empty Epsilon mock server is running')
  },
  error(error: Error) {
    return new Response('[EE MOCK]: Uh oh!!\n' + error.toString(), {
      status: 500
    })
  },
  websocket: {
    close(ws) {
      console.log('[EE MOCK]: Client disconnected')
    },
    open(ws) {
      console.log('[EE MOCK]: Client connected')
    },
    message(ws, message) {
      console.log(message)
    }
  }
})
