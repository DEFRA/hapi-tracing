# Hapi Tracing

Hapi Tracing is a Hapi plugin to make selected headers available during the lifecycle of the request without having to manually pass them or the request object into every call.

The main use-case for this is for propagating tracing headers, allowing them to be logged as well as forwarded on in other calls.

## What this does do.

Extracts a specific tracing header and makes it available to any call made as part of the request/response lifecycle via the getTraceId() helper.
Calling `getTraceId()` outside of a request handler returns no value.

## What this does not do.

The library does not automatically add the header to outbound http requests.
Automatically add these headers to the logger.

Due to the wide variety of HTTP Clients and log libraries support a single set feels too opinionated and trying to support all of them beyond the scope of the project as this point.

## How to use

The library consists of two parts:

1. The Hapi Plugin
2. The getTraceId() helper

The plugin should be registered when the server is created.

```js
await server.register({
  plugin: tracing,
  options: { tracingHeader: '<name-of-trace-header>' }
})
```

Once registered you will be able to call `getTraceId()` inside your controllers to return the value of the header if it has been passed in.

```js
const healthController = {
  handler: (request, h) => {
    return h.response({ message: `trace-id is ${getTraceId()}` }).code(200)
  }
}
```

The calls to getTraceId() don't have to originate from the controller. Any function called from the controller, directly or indirectly can use it.

Propagating the headers.

For this example we will be using node:fetch.
Below we have a helper function to make http calls. The helper sets some fixed headers (`Content-Type`), merges in some optional headers from `options`.
If traceId is available (via getTraceId()) it is also added into the request.

```js
async function getSomething() {
  return await fetch('http://localhost:1234/test', {
    method: 'get',
    headers: withTraceId({
      'Content-Type': 'application/json',
      'x-some-other-header': '1234'
    })
  })
}
```

Logging the header

For this example we will use Pino as our logger.
