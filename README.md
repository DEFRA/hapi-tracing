# Hapi Tracing

Hapi Tracing is a Hapi plugin to make selected headers available during the lifecycle of the request without having to manually pass them or the request object into every call.
The main use-case for this is for propagating tracing headers, allowing them to be logged as well as forwarded on in other calls.

## What this does do.

Hapi Tracing is registered as a plugin. A specific tracing header should be supplied via the plugin's options.
Once registered if an HTTP request is received with a specific tracking header the value of the header is extracted, stored in [AsyncLocalStorage](https://nodejs.org/api/async_context.html) and made available throughout the duration of the request.
A helper function `getTraceId()` provides access to the value of the tracking header without having to pass the request object across multiple calls.

## What this does not do.

- Automatically forwards the trace ID to other HTTP calls.
- Automatically logs the trace ID.

Built in support for this may be added in the future.

## Installing

`npm install @defra/hapi-tracing`

## Usage

The library consists of two parts:

1. The Hapi Plugin
2. The `getTraceId()` and `withTraceId` helpers

### Register the plugin

As part of creating the server, register the hapi-tracing plugin.

```js
import { tracing } from '@defra/hapi-tracing'

await server.register({
  plugin: tracing.plugin,
  options: { tracingHeader: 'x-your-trace-id' }
})
```

Once registered you will be able to call `getTraceId()` inside your controllers to return the value of the header if it has been passed in.

For example:

```js
import { getTraceId } from '@defra/hapi-tracing'

const healthController = {
  handler: (request, h) => {
    return h.response({ message: `trace-id is ${getTraceId()}` }).code(200)
  }
}
```

The calls to `getTraceId()` don't have to originate from the controller. Any function called from the controller, directly or indirectly can use it.

```js
import { getTraceId } from '@defra/hapi-tracing'

const healthController = {
  handler: (request, h) => {
    doSomething()
    return h.response().code(200)
  }
}

const doSomething = () => {
  doSomethingElse()
}

const doSomethingElse = () => {
  console.log(`trace-id is still ${getTraceId()}`)
}
```

## Common Use-Cases

### Propagating headers.

In order to track a request across multiple services you will need to forward the trace-id header on to other calls made as part of the request.

For this example we will be using node:fetch. Different HTTP clients may have different API's for settings headers but the concept should be the same.

The `hapi-tracing` package include a `withTraceId` helper that takes the name of the tracing header and an object containing the existing headers.
If the traceId has been set it returns the original header object with the traceId header and value added. If the traceId is not set then the original header object is return unmodified.

```js
import { withTraceId } from '@defra/hapi-tracing'

async function getSomething() {
  return await fetch('http://localhost:8080/test', {
    method: 'get',
    headers: withTraceId('x-your-trace-id', {
      'Content-Type': 'application/json',
      'x-some-other-header': '1234'
    })
  })
}
```

### Logging the header

Some loggers will automatically include the original HTTP request which will include tracing header as well as any other headers that are not redacted.
For this example we will use Pino with the ECS formatter as our logger.

```js
export const loggerOptions = {
  enabled: logConfig.enabled,
  level: 'info',
  // other setup
  nesting: true,
  mixin: () => {
    const mixinValues = {}
    const traceId = getTraceId()

    if (traceId) {
      mixinValues.trace = { id: traceId }
    }
    return mixinValues
  }
}

// elsewhere
const logger = pino(loggerOptions)
```

This will set the traceId to appear in the `trace.id` field in the structure logs.
