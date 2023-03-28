function pad(value: number, length: number = 2): string {
  return value.toString().padStart(length, "0")
}

export function time(): string {
  const date = new Date()

  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  const milliseconds = pad(date.getMilliseconds(), 3)

  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}
