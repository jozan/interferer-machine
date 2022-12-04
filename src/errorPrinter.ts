export function errorPrinter(message: string, errors: Error[]) {
  const [error, ...resterrors] = errors
  console.error(message, error.message)
  for (const error of resterrors) {
    console.error('    - ', error.message)
  }
}
