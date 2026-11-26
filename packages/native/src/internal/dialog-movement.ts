export interface DialogOffset {
  x: number;
  y: number;
}

export interface DialogMovementBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DialogLayoutSize {
  width: number;
  height: number;
}

const MOVE_STEP = 16;

/** Reachable offsets are every 16-point center-relative position plus both exact boundaries. */
export function dialogMovementStops(min: number, max: number): number[] {
  const stops = new Set<number>([0, min, max]);
  for (let step = MOVE_STEP; step < max; step += MOVE_STEP) stops.add(step);
  for (let step = -MOVE_STEP; step > min; step -= MOVE_STEP) stops.add(step);
  return [...stops].filter(value => value >= min && value <= max).sort((a, b) => a - b);
}

/** Clamp then snap to the nearest reachable point; equal-distance ties choose the lower offset. */
export function snapDialogMovementValue(value: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  return dialogMovementStops(min, max).reduce((nearest, stop) =>
    Math.abs(stop - clamped) < Math.abs(nearest - clamped) ? stop : nearest
  );
}

/** Move to the next reachable point, including an exact fractional viewport boundary. */
export function stepDialogMovementValue(
  value: number,
  direction: -1 | 1,
  min: number,
  max: number
): number {
  const stops = dialogMovementStops(min, max);
  const current = snapDialogMovementValue(value, min, max);
  if (direction > 0) return stops.find(stop => stop > current) ?? current;
  return [...stops].reverse().find(stop => stop < current) ?? current;
}

export function snapDialogMovement(
  offset: DialogOffset,
  bounds: DialogMovementBounds
): DialogOffset {
  return {
    x: snapDialogMovementValue(offset.x, bounds.minX, bounds.maxX),
    y: snapDialogMovementValue(offset.y, bounds.minY, bounds.maxY),
  };
}

export function clampDialogMovement(
  offset: DialogOffset,
  bounds: DialogMovementBounds
): DialogOffset {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, offset.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, offset.y)),
  };
}

/** Safe-area viewport-relative offsets, leaving a visible margin around the whole surface. */
export function getDialogMovementBounds(
  viewport: DialogLayoutSize,
  surface: DialogLayoutSize,
  margin: number
): DialogMovementBounds {
  const maxX = Math.max(0, (viewport.width - surface.width) / 2 - margin);
  const maxY = Math.max(0, (viewport.height - surface.height) / 2 - margin);
  return { minX: -maxX, maxX, minY: -maxY, maxY };
}
