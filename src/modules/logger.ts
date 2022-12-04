import { registerModule, ModuleInitResult } from '../moduleManager'

const subscribesTo = ['shieldsActive']

async function init(signal: AbortSignal): Promise<ModuleInitResult> {
  return {
    subscribesTo,
    listener(changed) {
      console.log('logger module: changed:', changed)
    }
  }
}

void registerModule(import.meta.url, {
  init
})
