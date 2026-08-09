const SNAP_DISTANCE = 0.01;
const SNAP_RATIOS = [0.25, 1 / 3, 0.5, 2 / 3, 0.75];

export function snapSplitRatio(ratio: number): number {
  const snapPoint = SNAP_RATIOS.find(
    (candidate) => Math.abs(candidate - ratio) <= SNAP_DISTANCE,
  );
  return snapPoint ?? ratio;
}
