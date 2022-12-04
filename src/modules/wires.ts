import { ModuleInitResult, registerModule } from '../moduleManager'

const subscribesTo: string[] = []

async function init(signal: AbortSignal): Promise<ModuleInitResult> {
  return {
    subscribesTo,
    listener(changed) {
      console.log('wires module: changed:', changed)
    }
  }
}

void registerModule(import.meta.url, {
  init
})
