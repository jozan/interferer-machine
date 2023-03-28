import { time } from "./time"

function stylize(text: string, attr: number): string {
  return `\x1b[${attr}m${text}\x1b[0m`
}

export function bold(text: string): string {
  return stylize(text, 1)
}

export function red(text: string): string {
  return stylize(text, 31)
}

export function green(text: string): string {
  return stylize(text, 32)
}

export function yellow(text: string): string {
  return stylize(text, 33)
}

export function faded(text: string): string {
  return stylize(text, 2)
}

export function tprint(text: string): void {
  console.log(text)
}

export function tlog(message: any): void {
  console.log(`[${time()}]`, message)
}

type LoggerFn = (...message: string[]) => void

interface Logger extends LoggerFn {
  error: LoggerFn
  warn: LoggerFn
}

export function createLogger(tag: string): Logger {
  const fadedTag = faded(`[${tag}]`)

  const logger = (...message: string[]) => {
    tlog(`${fadedTag} ${message.join(" ")}`)
  }

  logger.error = (...message: string[]) => {
    tlog(`${fadedTag} ${red(message.join(" "))}`)
  }

  logger.warn = (...message: string[]) => {
    tlog(`${fadedTag} ${yellow(message.join(" "))}`)
  }

  return logger
}
