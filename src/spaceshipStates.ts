export type SpaceshipState = {
  hull: number
  shieldsActive: 0 | 1
}

export type SpaceshipStateDiff = Partial<SpaceshipState>
export type SpaceshipStateKeys = keyof SpaceshipState

const SpaceshipRegistry = new Map<SpaceShipID, SpaceshipState>()

export function setSpaceshipState(
  id: SpaceShipID,
  newState: SpaceshipState
): [SpaceshipStateDiff | null, SpaceshipStateKeys[]] {
  const currentState = SpaceshipRegistry.get(id)
  const diff = currentState
    ? getSpaceshipStateDiff(currentState, newState)
    : newState

  SpaceshipRegistry.set(id, newState)

  if (Object.keys(diff).length > 0) {
    return [diff, [...(Object.keys(diff) as SpaceshipStateKeys[])]]
  }

  return [null, []]
}

export function getSpaceshipState(id: SpaceShipID) {
  return SpaceshipRegistry.get(id)
}

function getSpaceshipStateDiff(a: SpaceshipState, b: SpaceshipState) {
  const diff: SpaceshipStateDiff = {}

  if (a.hull !== b.hull) {
    diff.hull = b.hull
  }

  if (a.shieldsActive !== b.shieldsActive) {
    diff.shieldsActive = b.shieldsActive
  }

  return diff
}
