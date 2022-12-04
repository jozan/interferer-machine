import { registerModule } from '../moduleManager'

async function init(signal: AbortSignal): Promise<void> {
  console.log('logger module: init')
}

void registerModule(import.meta.url, {
  init
})
