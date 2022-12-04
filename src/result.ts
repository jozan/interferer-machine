export type Result<T, E extends Error[] = Error[]> = Ok<T> | Failure<E>
export type Ok<T> = { ok: true; value: T }
export type Failure<E extends Error[]> = { ok: false; errors: E }

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

export function failure<E extends Error[]>(...errors: E): Failure<E> {
  return { ok: false, errors: errors }
}
