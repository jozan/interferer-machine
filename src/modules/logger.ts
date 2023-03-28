import { registerModule, ModuleInitResult, Events } from "../moduleManager"

const subscribesTo: Events = ["shieldsActive", "hull"]

async function init(signal: AbortSignal): Promise<ModuleInitResult> {
  return
}

void registerModule(import.meta.url, {
  init,
  subscribesTo,
  listener(changed) {
    console.log("logger module: changed:", changed)
  },
})
