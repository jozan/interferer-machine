import { registerModule, ModuleInitResult, Events } from '../moduleManager'
import { chunk } from '../chunk'
import { invariant } from '../invariant'
import { shuffle } from '../shuffle'

const subscribesTo: Events = ['hull']

async function init(signal: AbortSignal): Promise<ModuleInitResult> {
  return
}

void registerModule(import.meta.url, {
  init,
  subscribesTo,
  listener(changed) {
    console.log('wires module: changed:', changed)
  }
})

const validX = [0, 1, 2, 3, 4] as const
const validY = [-1, ...validX] as const

type ValidX = typeof validX[number]
type ValidY = typeof validY[number]
type WirePair = [ValidX, ValidY][]

type WirePairGenerationConfig = {
  min: number
  max: number
}

// TODO: randomize how many wires are connected
//       y > -1 means connected
export function generateRandomWirePairs(
  config?: WirePairGenerationConfig
): WirePair[] {
  let pairs: [number, number][] = []
  const valuesX = [...validX]
  const valuesY = [...validX]
  shuffle(valuesX)
  shuffle(valuesY)

  while (valuesX.length > 0) {
    const x = valuesX.pop()!
    const y = valuesY.pop()!
    if (Math.random() <= 0.1) {
      pairs.push([x, -1])
    } else {
      pairs.push([x, y])
    }
  }

  return pairs as unknown as WirePair[]
}

export function deserializeWirePairs(wires: string): WirePair[] | null {
  try {
    const array = JSON.parse(wires)

    invariant(Array.isArray(array), 'wires must be an array')
    invariant(array.length === 10, 'wires must have 10 elements')

    const pairs = chunk(array, 2)

    invariant(
      pairs.every(([x, y]) => validX.includes(x) && validY.includes(y)),
      `wires must be valid numbers: for x: ${validX} and for y: ${validY}}`
    )

    const xValues = pairs.map(([x]) => x)

    invariant(
      new Set(xValues).size === xValues.length,
      'wires x must have unique values'
    )

    return pairs
  } catch (error) {
    const general = 'deserializeWirePairs error'

    if (error instanceof SyntaxError) {
      console.error(
        `${general}: input not valid JSON array. (${error.message})`
      )
      return null
    }

    if (error instanceof Error) {
      console.error(`${general}: ${error.message}`)
      return null
    }

    console.error(`${general}: unknown error happened`, error)
    return null
  }
}

type WirePairSerializationConfig = {
  pretty: boolean
}

export function serializeWirePairs(
  pairs: WirePair[],
  config?: WirePairSerializationConfig
): string {
  if (!config?.pretty) {
    return JSON.stringify(pairs.flat())
  }

  let serialized = '['

  for (let i = 0; i < pairs.length; i++) {
    const [x, y] = pairs[i]
    serialized += `${x},${y.toString().padStart(2, ' ')}${
      i === pairs.length - 1 ? ']' : ',  '
    }`
  }

  return serialized
}
