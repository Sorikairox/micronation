import * as THREE from "three";

export function sanitizeFlagData(rawFlagData) {
  return rawFlagData
    .filter((p) => !!p)
    .sort((a, b) => a.indexInflag - b.indexInFlag);
}

export function mapFlagDataToWorldCoordinates(
  flagData,
  flagIndexToCoordinateMap
) {
  const worldMap = [];

  for (let i = 0; i < flagData.length; i++) {
    const { x, y } = flagIndexToCoordinateMap[i] || { x: -1, y: -1 };
    if (!worldMap[x]) {
      worldMap[x] = [];
    }
    worldMap[x][y] = flagData[i];
  }

  return worldMap;
}

export function makeFlagTextureArray(width, height, flagPixelMap) {
  const textureArray = new Uint8Array(4 * width * height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const pixel = flagPixelMap[x]?.[y];
      const index = x + y * width;
      const strideIndex = index * 4;

      if (pixel) {
        const color = new THREE.Color(pixel.hexColor);
        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);

        textureArray[strideIndex] = r;
        textureArray[strideIndex + 1] = g;
        textureArray[strideIndex + 2] = b;
        textureArray[strideIndex + 3] = 255;
      } else {
        textureArray[strideIndex] = 0;
        textureArray[strideIndex + 1] = 0;
        textureArray[strideIndex + 2] = 0;
        textureArray[strideIndex + 3] = 0;
      }
    }
  }
  return textureArray;
}
