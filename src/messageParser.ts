import { chunk } from './chunk'
import { failure, ok, Result } from './result'

const validKeys = ['callsign', 'hull', 'shieldsActive'] as const
type ValidKey = typeof validKeys[number]

type Message = {
  callsign: SpaceShipID
  hull: number
  shieldsActive: 0 | 1
}

const validators = {
  callsign: withError(ensureString, `callsign must be a string`),
  hull: withError(ensureNumber, `hull must be a number`),
  shieldsActive: withError(ensureZeroOrOne, `shieldsActive must be 0 or 1`)
}

// TODO: parse incoming message to a Message object
export function parseMessage(input: string): Result<Message> {
  const message = JSON.parse(input)

  if (!Array.isArray(message)) {
    return failure(
      new Error('Invalid message. Expected an array but got: ' + input)
    )
  }

  if (message.length < 1) {
    return failure(new Error('Invalid message. Expected at least two elements'))
  }

  // make sure we are dealing with an array of tuples
  if (message.length % 2 !== 0) {
    return failure(new Error('Expected an even number of elements'))
  }

  const entries = chunk(message, 2)
  const errors: Error[] = []

  for (const [key, value] of entries) {
    if (!validKeys.includes(key as any)) {
      // TODO: maybe skip unkown keys?
      errors.push(new Error('Unknown key: ' + key))
      continue
    }

    const [error] = validators[key as ValidKey](value)
    if (error) {
      errors.push(new Error(error))
    }
  }

  if (errors.length > 0) {
    return failure(new Error('Errors parsing message'), ...errors)
  }

  return ok(Object.fromEntries(entries))
}

function withError<T>(
  validator: (value: unknown) => T | null,
  message: string
) {
  return (input: unknown): [null, T] | [string, null] => {
    const value = validator(input)

    if (value === null) {
      return [message, null]
    }

    return [null, value]
  }
}

function ensureString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
  }
  return null
}

function ensureNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return value
  }

  return null
}

function ensureZeroOrOne(value: unknown): 0 | 1 | null {
  if (value === 0 || value === 1) {
    return value
  }

  return null
}
