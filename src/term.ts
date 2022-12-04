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

export function faded(text: string): string {
  return stylize(text, 2)
}
