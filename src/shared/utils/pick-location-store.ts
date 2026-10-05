/**
 * Pending map pick — one-shot handoff from events/pick-location back to
 * events/create. expo-router back() carries no result, and replace() would
 * remount the form and wipe typed input, so the picker writes here and the
 * create form consumes on refocus.
 */
export interface PendingPick {
  latitude: number;
  longitude: number;
  venueName: string;
}

let pendingPick: PendingPick | null = null;

export function setPendingPick(pick: PendingPick): void {
  pendingPick = pick;
}

export function consumePendingPick(): PendingPick | null {
  const pick = pendingPick;
  pendingPick = null;
  return pick;
}
