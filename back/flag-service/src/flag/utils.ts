export function mapCoordinatesToTargetRatioRectangleDistribution(
  pixelCount,
  targetRatio
): Array<{x: number, y: number}> {
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

export function heatMapColorforValue(value: number){
  let h = (1.0 - value) * 240;
  if (h < 0)
    h = 0;
  return "hsl(" + h + ", 100%, 50%)";
}
