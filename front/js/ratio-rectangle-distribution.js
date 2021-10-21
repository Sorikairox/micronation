export const DESIRED_FLAG_RATIO = 1 / 2;

export function mapCoordinatesToTargetRatioRectangleDistribution(
  pixelCount,
  targetRatio
) {
  const map = [];

  let currentX = 0;
  let currentY = 1;

  function mapIndexToColumn(index) {
    const x = currentX;
    const y = index - currentX * currentY;
    map[index] = { x, y };

    if (y >= currentY - 1) {
      currentX++;
    }
  }

  function mapIndexToRow(index) {
    const x = index - currentX * currentY;
    const y = currentY;
    map[index] = { x, y };

    if (x >= currentX - 1) {
      currentY++;
    }
  }

  for (let i = 0; i < pixelCount; i++) {
    const hasEnoughRows = Math.floor(currentX * targetRatio) <= currentY - 1;
    if (hasEnoughRows) {
      mapIndexToColumn(i);
    } else {
      mapIndexToRow(i);
    }
  }

  return map;
}

export function getFlagResolutionFromIndexToCoordinateMap(
  indexToCoordinateMap
) {
  let width = 0,
    height = 0;
  for (let i = 0; i < indexToCoordinateMap.length; i++) {
    width = Math.max(width, indexToCoordinateMap[i].x + 1);
    height = Math.max(height, indexToCoordinateMap[i].y + 1);
  }
  return { width, height };
}
