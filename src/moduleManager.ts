import type { Promisable } from 'type-fest'
import { SpaceshipStateDiff } from './spaceshipStates'

type Event = 'hull' | 'shieldsActive'
export type Events = Event[]

export type ModuleInitResult = void

type ModuleInit = (signal: AbortSignal) => Promisable<ModuleInitResult>

type ModuleLoader = {
  // id: ModuleID
  // name: string
  init: ModuleInit
  subscribesTo: Events
  listener: (changed: SpaceshipStateDiff) => void
}

type ModuleLoaderWithSelector = ModuleLoader & {
  selector: ReturnType<typeof createSelector>
}

const moduleControllers = new Map<ModuleID, AbortController>()
export const moduleRegistry = new Map<ModuleID, ModuleLoaderWithSelector>()

const getModuleID = (url: string): ModuleID =>
  url.split('/').pop()!.split('.')[0] as ModuleID

function createSelector(
  subscribedEvents: Events
): (state: SpaceshipStateDiff) => SpaceshipStateDiff | null {
  return (state) => {
    const selectedState = subscribedEvents.reduce((acc, property) => {
      if (property in state) {
        // @ts-expect-error
        acc[property] = state[property]
      }

      return acc
    }, {} as SpaceshipStateDiff)

    // is empty object
    if (Object.keys(selectedState).length === 0) {
      return null
    }

    return selectedState
  }
}

async function setupModule(id: ModuleID, loader: ModuleLoader): Promise<void> {
  const controller = new AbortController()
  moduleControllers.set(id, controller)
  const loaderWithSelector = loader as ModuleLoaderWithSelector
  const { init, subscribesTo } = loaderWithSelector

  loaderWithSelector.selector = createSelector(subscribesTo)

  moduleRegistry.set(id, loaderWithSelector)

  await init(controller.signal)
}

export async function registerModule(url: string, ...loaders: ModuleLoader[]) {
  const id = getModuleID(url)

  for (const loader of loaders) {
    setupModule(id, loader)
  }
}

function sort<T>(input: T[]): T[] {
  return [...input].sort()
}

export function subscriptionKey(events: Events): number | bigint {
  return Bun.hash(sort(events).join(''), 1000)
}
