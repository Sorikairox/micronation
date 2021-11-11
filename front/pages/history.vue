<template>
  <v-app>
    <div v-if="!isMounted" class="min-h-screen w-100 absolute flex items-center top-0 bottom-0 left-0 right-0 bg-white z-50">
      <div class="big-loader m-auto"></div>
    </div>
    <div class="min-h-screen bg-grey-light">
      <div
        class="
          flex flex-col
          md:flex-row
          max-w-screen-2xl
          h-full
          grid-rows-2
          mx-auto
          pt-14
          items-center
          md:items-stretch
        "
      >
        <div
          id="flagContainer"
          class="
            flex-1 md:self-center
            self-stretch
            m-2 md:m-4
            h-auto
            cursor-move
          "
        >
          <div class="relative rounded-md overflow-hidden bg-white" style="border: 1px solid #ccc">
            <canvas
              id="flagCanva"
              class="w-full border-grey-dark"
              @mousemove="updateHoveredPixel"
              @mouseenter="isMouseOverCanvas = true"
              @mouseleave="isMouseOverCanvas = false"
            />
            <div class="overlay" v-if="isMouseOverCanvas">
              <div class="m-2 text-center">
                [{{ hoveredPixelPosition.x + 1 }}:{{ hoveredPixelPosition.y + 1 }}]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import fouloscopie from "fouloscopie";
import countdown from "@chenfengyuan/vue-countdown";
import { set, add } from 'date-fns';
import {
  DESIRED_FLAG_RATIO,
  getFlagResolutionFromIndexToCoordinateMap,
  mapCoordinatesToTargetRatioRectangleDistribution
} from "../js/ratio-rectangle-distribution";

//Initialising all the var
let flagWidth, flagHeight;
let flagPixels = [];
let flagIndexToCoordinateCache = [];
let flagPixelMap = new Array(flagWidth);

//Canvas var
let canvasContainer;
let canvas;
let canvasBoundingBox;
let bufferCanvas;

const MIN_ZOOM_LEVEL = 1;
let cameraZoom = 1;
let cameraPositionX = 0;
let cameraPositionY = 0;

let lastUpdate = new Date();

let indexInFlagToLocalIndexMap = {};

// const pixelNumberInFlag = 117721;
const pixelNumberInFlag = null;

function initializeFlagResolution() {
  flagIndexToCoordinateCache = mapCoordinatesToTargetRatioRectangleDistribution(pixelNumberInFlag || flagPixels.length, DESIRED_FLAG_RATIO);

  const resolution = getFlagResolutionFromIndexToCoordinateMap(flagIndexToCoordinateCache);
  const hasChanged = flagWidth !== resolution.width || flagHeight !== resolution.height;
  flagWidth = resolution.width;
  flagHeight = resolution.height;

  if (hasChanged) {
    initBufferCanvas();
  }

  return hasChanged;
}

function updateFlagPixelMap(data) {
  flagPixelMap = mapFlagDataToWorldCoordinates(data, flagIndexToCoordinateCache);
  drawFlagToBuffer();
}

function drawFlagToBuffer() {
  const ctx = bufferCanvas.getContext('2d');

  clearCanvas(bufferCanvas);

  const imageData = ctx.createImageData(flagWidth, flagHeight);
  const textureData = makeFlagTextureArray(flagWidth, flagHeight, flagPixelMap);
  for(let i = 0; i < textureData.length; i++) {
    imageData.data[i] = textureData[i] || 0;
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawPixelToBuffer(x, y, hexColor) {
  const ctx = bufferCanvas.getContext('2d');
  ctx.fillStyle = hexColor;
  ctx.fillRect(x, y, 1, 1);
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawWorld() {
  if (!canvas) {
    console.warn('drawWorld: canvas not ready');
    return;
  }

  clearCanvas(canvas);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bufferCanvas, 0, 0, canvas.width, canvas.height);
}

//Initalising the flag canvas
function initCanvas() {
  initBufferCanvas();
  canvasContainer = document.getElementById("flagContainer");
  canvas = document.getElementById("flagCanva");

  canvas.width = canvasContainer.clientWidth;
  canvas.height = ~~(canvas.width / 2);

  canvasBoundingBox = canvas.getBoundingClientRect();

  cameraZoom = 1;
  cameraPositionX = 0;
  cameraPositionY = 0;

  drawFlagToBuffer();
  drawWorld();
}

function initBufferCanvas() {
  bufferCanvas = document.createElement('canvas');
  bufferCanvas.width = flagWidth;
  bufferCanvas.height = flagHeight;
}

//Initalising the variables to their value
function init() {
  initCanvas();

  window.addEventListener("resize", onWindowResize);

  canvas.addEventListener("wheel", onWheel);

  canvas.addEventListener("mousedown", initFlagDrag);
  window.addEventListener("mousemove", dragFlag);
  window.addEventListener("mouseup", endFlagDrag);

  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", handleTouchEnd);
}

function onWindowResize() {
  initCanvas();
}

function onWheel(event) {
  event.preventDefault();

  const zoomDelta = event.deltaY * -0.01;
  zoomOnPositionByAmount({
    x: event.offsetX,
    y: event.offsetY,
  }, zoomDelta);
}

function zoomOnPositionByAmount(position, zoomDelta) {
  if (zoomDelta < 0 && cameraZoom <= MIN_ZOOM_LEVEL ||
      zoomDelta > 0 && cameraZoom >= getMaxZoomLevel()) {
    return;
  }

  const oldCameraZoom = cameraZoom;
  cameraZoom += zoomDelta;
  clampCameraScale();

  const oldCameraPositionX = cameraPositionX;
  const oldCameraPositionY = cameraPositionY;
  const mouseX = position.x;
  const mouseY = position.y;
  cameraPositionX += mouseX / oldCameraZoom - mouseX / cameraZoom;
  cameraPositionY += mouseY / oldCameraZoom - mouseY / cameraZoom;
  zoomAndTranslateContext(oldCameraZoom, oldCameraPositionX, oldCameraPositionY, cameraZoom, cameraPositionX, cameraPositionY);
  drawWorld();
}

let isDraggingFlag = false;
let mouseDragX, mouseDragY;
function getMouseOrTouchEventPosition(e) {
  const eventPosition = {
    x: e.offsetX,
    y: e.offsetY,
  };

  if (e.touches) {
    const touch = e.touches[0];
    const canvasBoundingBox = canvas.getBoundingClientRect();
    eventPosition.x = touch.clientX - canvasBoundingBox.left;
    eventPosition.y = touch.clientY - canvasBoundingBox.top;
  }

  return eventPosition;
}
function initFlagDrag(e) {
  isDraggingFlag = true;

  const eventPosition = getMouseOrTouchEventPosition(e);
  mouseDragX = eventPosition.x;
  mouseDragY = eventPosition.y;
}
function dragFlag(e) {
  if (isDraggingFlag) {
    const eventPosition = getMouseOrTouchEventPosition(e);

    const oldCameraPositionX = cameraPositionX;
    const oldCameraPositionY = cameraPositionY;
    cameraPositionX += (mouseDragX - eventPosition.x) / cameraZoom;
    cameraPositionY += (mouseDragY - eventPosition.y) / cameraZoom;

    mouseDragX = eventPosition.x;
    mouseDragY = eventPosition.y;

    zoomAndTranslateContext(cameraZoom, oldCameraPositionX, oldCameraPositionY, cameraZoom, cameraPositionX, cameraPositionY);

    drawWorld();
  }
}
function endFlagDrag() {
  isDraggingFlag = false;
}

let pinchPosition;
let pinchDistance;
function getPinchGesturePosition(touch1, touch2) {
  const canvasBoundingBox = canvas.getBoundingClientRect();
  const pos1 = { x: touch1.clientX, y: touch1.clientY };
  const pos2 = { x: touch2.clientX, y: touch2.clientY };
  return {
    x: (pos1.x + pos2.x) / 2 - canvasBoundingBox.left,
    y: (pos1.y + pos2.y) / 2 - canvasBoundingBox.top,
  };
}
function getPinchGestureDistance(touch1, touch2) {
  const pos1 = { x: touch1.clientX, y: touch1.clientY };
  const pos2 = { x: touch2.clientX, y: touch2.clientY };
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
}
function handleTouchStart(e) {
  if (e.touches.length >= 2) {
    pinchPosition = getPinchGesturePosition(...e.touches);
    pinchDistance = getPinchGestureDistance(...e.touches);
  } else {
    initFlagDrag(e);
  }
}
function handleTouchMove(e) {
  e.preventDefault();
  if (e.touches.length >= 2) {
    const newPinchDistance = getPinchGestureDistance(...e.touches);

    const difference = newPinchDistance - pinchDistance;
    const zoomDelta = difference * 0.1;
    zoomOnPositionByAmount(pinchPosition, zoomDelta);

    pinchDistance = newPinchDistance;
  } else {
    dragFlag(e);
  }
}
function handleTouchEnd() {
  endFlagDrag();
}

function clampCameraScale() {
  cameraZoom = Math.min(Math.max(cameraZoom, MIN_ZOOM_LEVEL), getMaxZoomLevel());
}

function zoomAndTranslateContext(currentZoom, currentPositionX, currentPositionY, newScale, newPositionX, newPositionY) {
  const ctx = canvas.getContext('2d');

  ctx.translate(currentPositionX, currentPositionY);

  const relativeZoom = newScale / currentZoom;
  ctx.scale(relativeZoom, relativeZoom);

  ctx.translate(-newPositionX, -newPositionY);
}

function getMaxZoomLevel() {
  return Math.sqrt(flagPixelMap.length);
}

import {
  makeFlagTextureArray,
  mapFlagDataToWorldCoordinates,
} from "../js/flag";
import {
  applyEventToFlagFromIndexUntilDate,
  applyGivenEventsNumberToFlagFromIndex,
  getAllPixelEvent
} from "../js/pixelEventService";

export default {
  name: "edit",
  components: {
  },
  data() {
    return {
      fouloscopieSdk: null,
      token: undefined,
      color: "#ff0000",
      x: ~~(Math.random() * flagWidth),
      y: ~~(Math.random() * flagHeight),
      isMounted: false,
      requesting: false,
      loading: false,
      hoveredPixelPosition: {
        x: 0,
        y: 0,
      },
      hoveredPixel: null,
      editedPixel: null,
      modifiedPixelX: 1,
      modifiedPixelY: 1,
      isMouseOverCanvas: false,
    };
  },
  computed: {
  },
  methods: {
    updateHoveredPixel(e) {
      let drawWidth = canvas.width / flagWidth;
      let drawHeight = canvas.height / flagHeight;

      this.hoveredPixelPosition = {
        x: Math.floor((cameraPositionX + e.offsetX / cameraZoom) / drawWidth),
        y: Math.floor((cameraPositionY + e.offsetY / cameraZoom) / drawHeight),
      };

      this.hoveredPixel = flagPixelMap[this.hoveredPixelPosition.x]?.[this.hoveredPixelPosition.y] || null;
    },
    showTimelapseWithTimeAsTick() {
      this.startingEvent = applyEventToFlagFromIndexUntilDate(flagPixels, indexInFlagToLocalIndexMap, this.pixelEvents, this.startingEvent, this.nextDate);
      initializeFlagResolution();
      updateFlagPixelMap(flagPixels);
      drawFlagToBuffer();
      drawWorld();
      this.nextDate = add(this.nextDate, {
        minutes: 10
      });
      if (this.startingEvent === this.pixelEvents.length) {
        clearInterval(this.historyRefreshIntervalId);
      }
    },
    showTimelapseWithEventAsTick() {
      applyGivenEventsNumberToFlagFromIndex(flagPixels, indexInFlagToLocalIndexMap, this.pixelEvents, this.startingEvent, this.eventPerLoop);
      initializeFlagResolution();
      updateFlagPixelMap(flagPixels);
      drawFlagToBuffer();
      drawWorld();
      this.startingEvent += this.eventPerLoop;
      console.log(this.startingEvent, this.pixelEvents.length);
      console.log(flagPixels.length);
      if (this.startingEvent > this.pixelEvents.length) {
        clearInterval(this.historyRefreshIntervalId);
      }
    }
  },
  async mounted() {
    this.fouloscopieSdk = await fouloscopie();
    this.token = this.fouloscopieSdk.userInfo.token;
    this.pixelEvents = await getAllPixelEvent();
    flagPixels = [];
    this.nextDate = new Date();
    this.nextDate = set(this.nextDate, {
      year: 2021,
      month: 10,
      date: 1,
      hours: 15
    });
    this.startingEvent = 0;
    this.eventPerLoop = 20000;
    this.showTimelapseWithTimeAsTick();
    this.historyRefreshIntervalId = setInterval(() => {
      this.showTimelapseWithTimeAsTick();
    }, 1000);
    init();
    this.isMounted = true;
  },
  beforeDestroy() {
    clearInterval(this.historyRefreshIntervalId);
  },
};
</script>


<style>
</style>
