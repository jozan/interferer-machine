// Based on Pico (https://github.com/yusukebe/pico/blob/main/src/pico.ts)
// adjusted to support Bun

import { Server } from 'bun'

declare global {
  interface Request {
    param: {
      (key: string): string
      (): Record<string, string>
    }
    query: {
      (key: string): string | null
    }
    header: {
      (name: string): string | null
    }
  }
}

type Context = {
  req: Request
  server: Server
  text: (text: string) => Response
  json: (json: object) => Response
}

const METHODS = [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head'
] as const

export type Handler = (context: Context) => Response | Promise<Response>

function defineDynamicClass(): {
  new (): {
    [key in typeof METHODS[number]]: (path: string, handler: Handler) => Router
  }
} {
  return class {} as never
}

export class Router extends defineDynamicClass() {
  private r: {
    pattern: URLPattern
    method: string
    handler: Handler
  }[] = []
  constructor() {
    super()
    ;[...METHODS].map((method) => {
      this[method] = (path: string, handler: Handler) =>
        this.on(method, path, handler)
    })
  }

  on = (method: string, path: string, handler: Handler) => {
    const route = {
      pattern: new URLPattern({ pathname: path }),
      method: method.toLowerCase(),
      handler
    }
    this.r.push(route)
    return this
  }

  private match(
    method: string,
    url: string
  ): { handler: Handler; result: URLPatternResult } | undefined {
    method = method.toLowerCase()
    for (const route of this.r) {
      const match = route.pattern.exec(url)
      if (
        (match && route.method === 'all') ||
        (match && route.method === method)
      ) {
        return { handler: route.handler, result: match }
      }
    }
  }

  fetch = (req: Request, server: Server) => {
    const match = this.match(req.method, req.url)
    if (match === undefined) {
      return new Response('Not Found', { status: 404 })
    }

    Request.prototype.param = function (this: Request, key?: string) {
      const groups = match.result.pathname.groups
      if (key) {
        return groups[key]
      }

      return groups
    } as InstanceType<typeof Request>['param']

    req.query = (key) => new URLSearchParams(match.result.search.input).get(key)
    req.header = (key) => req.headers.get(key)

    const response = match.handler({
      req,
      server,
      text: (text) => new Response(text),
      json: (json) =>
        new Response(JSON.stringify(json), {
          headers: {
            'Content-Type': 'application/json'
          }
        })
    })

    return response
  }
}
