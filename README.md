# interferer-machine

Some kind of service for [Empty Epsilon](https://github.com/daid/EmptyEpsilon).

## Pre-requisites

- macOS / Linux
- [Bun](https://bun.sh) - the runtime

## Setupping

To install dependencies:

```sh
bun install
```

## Running

To run server:

```sh
PORT=8080 EE_CLIENT_WS="ws://localhost:8081" bun run main.tsx
```

To run Empty Epsilon mock game server to develop and test out server implementation without having to run Empty Epsilon:

```
PORT=8081 INTERVAL=1000 bun run ee.mock.ts
```

## TODO

- [x] Parse incoming websocket messages from EE into a more usable format
- [x] Swap out websocket server to be a client that connects to EE
- [ ] Register connected spaceships by their callsigns (if those are unique...)
- [x] Simple HTTP server to receive messages from devices
- [ ] Simple HTTP UI to display connected spaceships and devices
- [x] Create event system that emits events when spaceship's state changes (e.g. when it enters into a nebula, takes hull damage, subystem changes)
- [x] Module can subscribe to events such as hull damage, ship modules (reactor, shields, etc)
- [ ] support these events (list content can change...)
  - `hullDamage`
  - `shieldsState`
  - `systemReactor`
  - `systemBeamweapons`
  - `systemMissilesystem`
  - `systemManeuver`
  - `systemImpulse`
  - `systemWarp`
  - `systemJumpdrive`
  - `systemFrontshield`
  - `systemRearshield`
