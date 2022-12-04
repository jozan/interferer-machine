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

const moduleControllers = new Map<ModuleID, AbortController>()
export const moduleRegistry = new Map<ModuleID, ModuleLoader>()
const moduleSubscriptions = new Map<number | bigint, Set<ModuleID>>()

const getModuleID = (url: string): ModuleID =>
  url.split('/').pop()!.split('.')[0] as ModuleID

async function setupModule(id: ModuleID, loader: ModuleLoader): Promise<void> {
  const controller = new AbortController()
  moduleControllers.set(id, controller)
  moduleRegistry.set(id, loader)

  const { init, subscribesTo } = loader

  if (subscribesTo.length > 0) {
    registerListener(subscribesTo, id)
  }

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

function registerListener(subscribesTo: Events, moduleId: ModuleID): void {
  const key = subscriptionKey(subscribesTo)

  if (!moduleSubscriptions.has(key)) {
    moduleSubscriptions.set(key, new Set([moduleId]))
    return
  }

  const modules = moduleSubscriptions.get(key)!
  modules.add(moduleId)
}

export function getSubscribers(events: Events): Set<ModuleID> {
  const key = subscriptionKey(events)

  if (!moduleSubscriptions.has(key)) {
    return new Set()
  }

  return moduleSubscriptions.get(key)!
}
