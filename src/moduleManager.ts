import type { Promisable } from 'type-fest'

type ModuleInitResult = void | false
type ModuleInit = (signal: AbortSignal) => Promisable<ModuleInitResult>

type ModuleLoader = {
  // id: ModuleID
  // name: string
  init: ModuleInit
}

const moduleControllers = new Map<ModuleID, AbortController>()
export const moduleRegistry = new Map<ModuleID, ModuleLoader>()

const getModuleID = (url: string): ModuleID =>
  url.split('/').pop()!.split('.')[0] as ModuleID

async function setupModule(id: ModuleID, loader: ModuleLoader): Promise<void> {
  const controller = new AbortController()
  moduleControllers.set(id, controller)
  moduleRegistry.set(id, loader)
  // const result = await loader.init(controller.signal)
}

export async function registerModule(url: string, ...loaders: ModuleLoader[]) {
  const id = getModuleID(url)

  for (const loader of loaders) {
    setupModule(id, loader)
  }
}
