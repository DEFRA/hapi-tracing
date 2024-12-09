import { Server } from '@hapi/hapi'

import { tracing } from './index.js'

describe('#tracing', () => {
  describe('When tracing is enabled', () => {
    let server

    beforeEach(async () => {
      server = new Server()

      await server.register({
        plugin: tracing.plugin,
        options: { tracingEnabled: true, tracingHeader: 'x-cdp-request-id' }
      })
    })

    afterEach(async () => {
      await server.stop({ timeout: 0 })
    })

    test('Should register the plugin', () => {
      expect(server.registrations).toEqual({
        tracing: {
          name: 'tracing',
          options: { tracingEnabled: true, tracingHeader: 'x-cdp-request-id' },
          version: '0.1.0'
        }
      })
    })

    test('Should have expected decorations', () => {
      expect(server.decorations.request).toStrictEqual(['getTraceId'])
      expect(server.decorations.server).toStrictEqual(['getTraceId'])
    })

    test('Should add "x-cdp-request-id" to the request store', async () => {
      const mockTraceId = 'mock-trace-id-123456789'

      server.route({
        method: 'GET',
        path: '/testing',
        handler: (request, h) => {
          expect(request.getTraceId()).toBe(mockTraceId)

          return h.response({ message: 'success' }).code(200)
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/testing',
        headers: { 'x-cdp-request-id': mockTraceId }
      })

      expect(result).toEqual({ message: 'success' })
      expect(statusCode).toBe(200)
      expect.assertions(3)
    })
  })

  describe('Without "x-cdp-request-id" header', () => {
    let server

    beforeEach(async () => {
      server = new Server()

      await server.register({
        plugin: tracing.plugin,
        options: { tracingEnabled: true, tracingHeader: 'x-cdp-request-id' }
      })
    })

    afterEach(async () => {
      await server.stop({ timeout: 0 })
    })

    test('"x-cdp-request-id" should not be in the request store', async () => {
      server.route({
        method: 'GET',
        path: '/cats-url',
        handler: (request, h) => {
          expect(request.getTraceId()).toBeUndefined()

          return h.response({ message: 'success' }).code(200)
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/cats-url'
      })

      expect(result).toEqual({ message: 'success' })
      expect(statusCode).toBe(200)
      expect.assertions(3)
    })
  })

  describe('When tracing is disabled', () => {
    let server

    beforeEach(async () => {
      server = new Server()

      await server.register({
        plugin: tracing.plugin,
        options: { tracingHeader: null }
      })
    })

    afterEach(async () => {
      await server.stop({ timeout: 0 })
    })

    test('Should have registered the plugin', () => {
      expect(server.registrations).toEqual({
        tracing: {
          name: 'tracing',
          options: { tracingHeader: null },
          version: '0.1.0'
        }
      })
    })

    test('Should have expected decorations', () => {
      expect(server.decorations.request).toStrictEqual(['getTraceId'])
      expect(server.decorations.server).toStrictEqual(['getTraceId'])
    })

    test('Should not add "x-cdp-request-id" to the request store', async () => {
      const mockTraceId = 'mock-trace-id-4564569'

      server.route({
        method: 'GET',
        path: '/different-url',
        handler: (request, h) => {
          expect(request.getTraceId()).toBeUndefined()

          return h.response({ message: 'success' }).code(200)
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/different-url',
        headers: { 'x-cdp-request-id': mockTraceId }
      })

      expect(result).toEqual({ message: 'success' })
      expect(statusCode).toBe(200)
      expect.assertions(3)
    })
  })
})
