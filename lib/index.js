import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

/**
 * Return's the request's trace id, if set else null.
 * @return {string|null}
 */
const getTraceId = () => asyncLocalStorage.getStore()?.get('traceId')

/**
 * Appends the trace id to an existing set of headers.
 * @param { string } headerName name of header to put trace id in
 * @param { Object } headers object container existing headers
 * @return { Object }
 */
function withTraceId(headerName, headers = {}) {
  const traceId = getTraceId()
  if (traceId) {
    headers[headerName] = traceId
  }
  return headers
}
/**
 * Wrap the request lifecycle in an asyncLocalStorage run call. This allows the
 * passed store to be available during the request lifecycle.
 * @param { Request } request
 * @param { Map<string, string> } store
 */
function wrapLifecycle(request, store) {
  const requestLifecycle = request._lifecycle.bind(request)
  request._lifecycle = () => asyncLocalStorage.run(store, requestLifecycle)
}

/**
 * @satisfies {Plugin}
 */
const tracing = {
  plugin: {
    name: 'tracing',
    version: '0.1.0',
    once: true,
    register(server, options) {
      if (options.tracingHeader) {
        server.ext('onRequest', (request, h) => {
          const store = new Map()
          const tracingHeader = options?.tracingHeader
          const traceId = request.headers[tracingHeader]
          store.set('traceId', traceId)
          wrapLifecycle(request, store)
          return h.continue
        })
      }
      server.decorate('request', 'getTraceId', getTraceId)
      server.decorate('server', 'getTraceId', getTraceId)
    }
  },
  options: {
    tracingHeader: 'x-cdp-request-id'
  }
}

export { tracing, getTraceId, withTraceId }
