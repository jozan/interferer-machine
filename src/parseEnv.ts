export function parseEnv<T>(key: string, parser: (value: string) => T): T {
  const value = process.env[key]

  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  const parsedValue = parser(value)

  // allow 0 as a valid value
  if (parsedValue === 0) {
    return parsedValue
  }

  if (!Boolean(parsedValue)) {
    throw new Error(
      `Invalid value for environment variable: ${key}, parsed to ${parsedValue} (${typeof parsedValue})`
    )
  }

  return parsedValue
}
