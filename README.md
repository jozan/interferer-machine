# interferer-machine

## Pre-requisites

- macOS / Linux
- [Bun](https://bun.sh)

## Setupping

To install dependencies:

```sh
bun install
```

## Running

To run server:

```sh
PORT=8080 bun run main.ts
```

To run Empty Epsilon mock client to develop and test out server implementation without having to run Empty Epsilon:

```sh
WEBSOCKET_URL=ws://127.0.0.1:8080 PORT=8088 bun run ee.mock.ts
```
