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

## TODO

- [ ] Parse incoming websocket messages from EE into a more usable format
- [ ] Register connected spaceships by their callsigns (if those are unique...)
- [ ] Create event system that emits events when spaceship's state changes (e.g. when it enters into a nebula, takes hull damage, subystem changes)
- [ ] Module can subscribe to events such as hull damage, ship modules (reactor, shields, etc)
  - events are
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
