import { parseEnv } from './src/parseEnv'

const data = ['callsign', 'Earthship Sagan', 'hull', 250.0, 'shieldsActive', 0]

function pickRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateData() {
  const callsign = pickRandom(['Earthship Sagan', 'Moonship Hawking'])
  const hull = Math.random() * 1000
  const shieldsActive = Math.random() > 0.5 ? 1 : 0

  return ['callsign', callsign, 'hull', hull, 'shieldsActive', shieldsActive]
}

const PORT = parseEnv('PORT', Number) || 8080
const WEBSOCKET_URL =
  parseEnv('WEBSOCKET_URL', (value) => {
    if (!value.startsWith('ws://')) {
      throw new Error('Invalid websocket URL')
    }
    return value
  }) || 'ws://127.0.0.1:8080'

let wsReconnectCounter = 1

function connectWebSocket() {
  console.log('[EE MOCK]: connecting to websocket server...')
  const ws = new WebSocket(WEBSOCKET_URL)

  ws.addEventListener('message', (e) => {
    const message = JSON.parse(e.data)
    console.log('[EE MOCK]: Received message:', message)
  })

  ws.addEventListener('open', (e) => {
    console.log(`[EE MOCK]: Connected to the websocket server: ${ws.url}`)
    wsReconnectCounter = 1
    sendData()
  })

  ws.addEventListener('error', (e) => {
    console.log('[EE MOCK]: Error:', e)
  })

  ws.addEventListener('close', (e) => {
    if (wsReconnectCounter === 1) {
      console.log('[EE MOCK]: Disconnected from the websocket server')
    }
    setTimeout(
      () => {
        console.log(`[EE MOCK]: Reconnect attempt ${wsReconnectCounter}`)
        wsReconnectCounter += 1
        connectWebSocket()
      },
      wsReconnectCounter <= 5 ? 1000 : 10000
    )
  })

  function sendData() {
    ws.send(JSON.stringify(generateData()))
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
  }
})
