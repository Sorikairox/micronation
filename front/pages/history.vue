<template>
  <v-app>
    <div v-if="!isMounted" class="min-h-screen w-100 absolute flex items-center top-0 bottom-0 left-0 right-0 bg-white z-50">
      <div class="m-auto">
        <div class="big-loader m-auto"></div>
        <div>Récuperation de tout l'historique du drapeau (300MO), cela peut prendre du temps.</div>
      </div>
    </div>
    <div class="min-h-screen bg-grey-light">
      <div
        class="
          flex flex-col
          max-w-screen-2xl
          h-full
          grid-rows-2
          mx-auto
          pt-14
          items-center
          md:items-stretch
        "
      >
        <div>
          <div class="flex">
            <div>
              <div>
                <label for="secondPerLoop">Temps écoulé par frame en secondes (15 fps) : </label>
                <input id="secondPerLoop" class="border-2 border-black" v-model="secondsPerLoop">
              </div>
              <div>
                <label for="showBot">Jouer les évenements des bots: </label>
                <input id="showBot" type="checkbox" v-model="showBot">
              </div>
            </div>
            <div>
              <div>
                <label for="fullScreen">Plein écran: </label>
                <input id="fullScreen" type="checkbox" v-model="fullScreen">
              </div>
              <div>
                Raccourcis clavier : P pour mettre/retirer la pause
              </div>
            </div>
            <AppButton
              size="medium"
              v-on:click="playTimelapse()"
              v-if="!playing"
              variant="contained"
              class="bg-primary-dark my-auto ml-auto mr-2"
            >
              <span>Lancer le timelapse</span>
            </AppButton>
            <AppButton
              size="medium"
              v-on:click="paused = true"
              v-if="playing && !paused"
              variant="contained"
              class="bg-primary-dark my-auto ml-auto mr-2"
            >
              <span>Mettre en pause</span>
            </AppButton>
            <AppButton
              size="medium"
              v-on:click="paused = false"
              v-if="paused"
              variant="contained"
              class="bg-primary-dark my-auto ml-auto mr-2"
            >
              <span>Continuer</span>
            </AppButton>
          </div>
        </div>
        <div
          id="flagContainer"
          class="
            flex-1 md:self-center
            self-stretch
            mb-2 mt-0 md:m-4
            h-auto
            cursor-move
            w-full
          "
        >
          <div class="bg-black text-white text-center">{{nextDate}}</div>
          <div class="relative rounded-md overflow-hidden bg-white" style="border: 1px solid #ccc">
            <canvas
              id="flagCanva"
              class="w-full border-grey-dark"
              @mousemove="updateHoveredPixel"
            />
          </div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import fouloscopie from "fouloscopie";
import {set, add, isBefore, parseISO} from 'date-fns';
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
const pixelNumberInFlag = 131815;


async function toggleFullScreen() {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    let element = document.querySelector('#flagContainer');
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
}


function initializeFlagResolution() {
  console.log(pixelNumberInFlag);
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
function initCanvas(doInit = true) {
  if (doInit) {
    initBufferCanvas();
  }
  canvasContainer = document.getElementById("flagContainer");
  canvas = document.getElementById("flagCanva");

  canvas.width = canvasContainer.clientWidth;
  canvas.height = ~~(canvas.width / 2);

  canvasBoundingBox = canvas.getBoundingClientRect();

  cameraZoom = 1;
  cameraPositionX = 0;
  cameraPositionY = 0;

  if (doInit) {
    drawFlagToBuffer();
  }
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
  initCanvas(false);
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
  addOrUpdatePixelInFlag,
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
      startingEvent: 0,
      nextDate: new Date(),
      secondsPerLoop: 1000,
      showDate: true,
      showBot: false,
      playing: false,
      paused: false,
      fullScreen: false,
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
      if (!this.paused) {
        let actualEvent = this.pixelEvents[this.startingEvent];
        while (this.pixelEvents[this.startingEvent] && isBefore(parseISO(actualEvent.createdAt.$date), this.nextDate)) {
          actualEvent = this.pixelEvents[this.startingEvent];
          if (!actualEvent.ignored || this.showBot) {
            const x = flagIndexToCoordinateCache[indexInFlagToLocalIndexMap[actualEvent.data.indexInFlag]]?.x;
            const y = flagIndexToCoordinateCache[indexInFlagToLocalIndexMap[actualEvent.data.indexInFlag]]?.y;
            if (x != null && y != null) {
              drawPixelToBuffer(x, y, actualEvent.data.hexColor);
            }
          }
          this.startingEvent++;
        }
        drawWorld();
        this.nextDate = add(this.nextDate, {
          seconds: this.secondsPerLoop
        });
      }
      if (this.startingEvent >= this.pixelEvents.length - 1) {
        this.nextDate = 'THE END !';
        clearInterval(this.historyRefreshIntervalId);
      } else {
        this.historyRefreshIntervalId = setTimeout(() => {
          this.showTimelapseWithTimeAsTick();
        }, 66);
      }
    },
    async playTimelapse() {
      try {
        if (this.fullScreen) {
          await toggleFullScreen();
        }
        clearInterval(this.historyRefreshIntervalId);
        this.playing = true;
        this.nextDate = new Date();
        this.startingEvent = 0;
        this.nextDate = set(this.nextDate, {
          year: 2021,
          month: 10,
          date: 1,
          hours: 13
        });
        this.showTimelapseWithTimeAsTick();
      } catch (e) {
        console.log(e);
      }
    },
    keyPress(e) {
      if (e.key === 'p') {
        this.paused = !this.paused;
      }
    }
  },
  async mounted() {
    this.pixelEvents = await getAllPixelEvent();
    this.pixelEvents = this.pixelEvents.sort((a, b) => {
      return a.eventId - b.eventId
    });
    initializeFlagResolution();
    flagPixels = [];
    flagPixelMap = [];
    let i = 0;
    while (i < this.pixelEvents.length) {
      const event = this.pixelEvents[i];
      addOrUpdatePixelInFlag(flagPixels, event.data, indexInFlagToLocalIndexMap);
      i++;
    }
    flagPixels = flagPixels.sort((a, b) => a.indexInFlag - b.indexInFlag);
    for (let i = 0; i < flagPixels.length; i++) {
      indexInFlagToLocalIndexMap[flagPixels[i].indexInFlag] = i;
    }
    init();
    flagPixelMap = mapFlagDataToWorldCoordinates(flagPixels, flagIndexToCoordinateCache);
    this.nextDate = set(this.nextDate, {
      year: 2021,
      month: 10,
      date: 1,
      hours: 13
    });
    window.addEventListener('keypress', this.keyPress)
    this.isMounted = true;
  },
  beforeDestroy() {
    clearTimeout(this.historyRefreshIntervalId);
  },
};
</script>


<style>
</style>
