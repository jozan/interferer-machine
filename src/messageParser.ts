type Command = 'register' | 'unregister'

type Message =
  | {
      command: 'register'
      payload: string
    }
  | {
      command: 'unregister'
      payload: string
    }

function ensureString(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  return null
}

function ensureNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  return null
}

type Result<T> = T | Error

// TODO: parse incoming message to a Message object

// function messageParser(message: string): Result<Message> {
//   try {
//     const parsed = JSON.parse(message)
//     if (Array.isArray(parsed)) {
//       if (parsed.length === 2) {
//         const [command, payload] = parsed
//         if (typeof command === 'string') {
//           switch (command) {
//             case 'register':
//               return {
//                 command,
//                 payload: ensureString(payload)
//               }
//             case 'unregister':
//               return {
//                 command,
//                 payload: ensureString(payload)
//               }
//             default:
//               return new Error("unknown command: '" + command + "'")
//         }
//         return parsed
//       }
//     }
//     return parsed
//   } catch (error) {
//     console.error(error)
//     return null
//   }
// }
