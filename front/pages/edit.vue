<template>
  <v-app>
    <div class="min-h-screen bg-grey-light">
      <div
        class="
          flex flex-col
          md:flex-row
          max-w-screen-xl
          h-full
          grid-rows-2
          mx-auto
          pt-16
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
          "
        >
          <div>
            <canvas
              id="flagCanva"
              class="w-full border-2 rounded-md border-grey-dark"
            />
          </div>
        </div>
        <div
          class="
            flex flex-col
            m-2 md:mx-4 md:mb-4 md:ml-0
            p-4
            bg-white
            rounded-lg
            h-100
            justify-between
          "
          style="max-width: 500px"
        >
          <div @click="showHelp = true" class="mr-0 ml-auto"><img src="https://img.icons8.com/ios/50/000000/help.png"/></div>

          <div class="flex-col justify-between flex-1 flex md:hidden">
            <div>Voisin de gauche : <span v-if="leftPixel">[{{leftPixel.x + 1}}:{{leftPixel.y + 1}}] {{leftPixel.username}} </span><span v-else>Pas de voisin</span></div>
            <div>Voisin du haut : <span v-if="topPixel">[{{topPixel.x + 1}}:{{topPixel.y + 1}}] {{topPixel.username}} </span><span v-else>Pas de voisin</span></div>
            <div>Voisin de droite : <span v-if="rightPixel">[{{rightPixel.x + 1}}:{{rightPixel.y + 1}}] {{rightPixel.username}}</span><span v-else>Pas de voisin</span></div>
            <div>Voisin du bas : <span v-if="bottomPixel">[{{bottomPixel.x + 1}}:{{bottomPixel.y + 1}}] {{bottomPixel.username}} </span><span v-else>Pas de voisin</span></div>
            <AppButton
              size="medium"
              v-on:click="Overlay()"
              class="my-auto mx-auto pixelButton"
              :style="myPixelButtonStyle"
            >
              [{{ x + 1 }}:{{ y + 1 }}] Toi
            </AppButton>
          </div>
          <div class="flex-col justify-between flex-1 hidden md:flex">
              <div class="flex justify-center">
                <AppButton v-if="topPixel"
                  size="medium"
                  class="text-white my-auto pixelButton"
                  :style="topPixelButtonStyle"
                >
                  [{{topPixel.x + 1}}:{{topPixel.y + 1}}] {{topPixel.username}}
                </AppButton>
              </div>
              <div class="flex justify-between">
                <AppButton v-if="leftPixel"
                           size="medium"
                           class="text-white my-auto pixelButton"
                           :style="leftPixelButtonStyle"
                >
                   [{{leftPixel.x + 1}}:{{leftPixel.y + 1}}] {{leftPixel.username}}
                </AppButton>
                <AppButton
                  size="medium"
                  v-on:click="Overlay()"
                  class="my-auto pixelButton"
                  :style="myPixelButtonStyle"
                >
                  [{{ x + 1 }}:{{ y + 1 }}] Toi
                </AppButton>
                <AppButton v-if="rightPixel"
                           size="medium"
                           class="text-white my-auto pixelButton"
                           :style="rightPixelButtonStyle"
                >
                  [{{rightPixel.x + 1}}:{{rightPixel.y + 1}}] {{rightPixel.username}}
                </AppButton>
              </div>
              <div class="flex justify-center">
                <AppButton v-if="bottomPixel"
                           size="medium"
                           class="text-white my-auto pixelButton"
                           :style="bottomPixelButtonStyle"
                >
                  [{{bottomPixel.x + 1}}:{{bottomPixel.y + 1}}] {{bottomPixel.username}}
                </AppButton>
              </div>
            </div>
            <hr class="mt-1 border-grey-light">
            <div class="flex flex-col text-center">
              <h1 class="m-4">Modifies la couleur de ton pixel ci-dessous</h1>
              <chrome-picker style="width: 100%;height: auto" v-model="color" @input="change"></chrome-picker>
              <AppButton
                size="medium"
                v-on:click="Finish()"
                variant="contained"
                class="bg-primary-dark mt-4"
              >
                Valider
              </AppButton>
            </div>
        </div>
      </div>
      <AppAlert
        v-if="this.errorMessage == 'CooldownNotEndedYet'"
        variant="error"
        @close="closeCooldownModal"
        :open="openFailedEditModal"
        >La date de dernière modification de ton pixel est trop récente,
        merci de patienter ! <br />
        Temps restant :
        <countdown
          :time="this.cooldownTime"
          :interval="1000"
          tag="span"
          class="text-2xl font-bold"
        >
          <template slot-scope="props"
            >{{ props.minutes }} : {{ props.seconds }}</template
          ></countdown
        ></AppAlert
      >
      <AppAlert
        v-else
        variant="error"
        @close="closeCooldownModal"
        :open="openFailedEditModal"
      >
        <pre>{{ this.errorMessage }}</pre></AppAlert
      ><AppAlert
        variant="info"
        @close="closeSuccessfulModal"
        :open="openSuccessEditModal"
        >La couleur a été changée avec succès !</AppAlert
      >
      <AppAlert
        variant="info"
        @close="closeHelpModal"
        :open="showHelp"
      ><div>
        <ul>
          <li> Le drapeau est divisé en autant de zone de tailles égales qu'il y a de joueurs. + de joueurs = + de zones un peu plus petites</li>
          <li> Chaque joueur controle la couleur de sa zone. Tu ne peux modifier la couleur de ta zone que 1 fois toutes les {{ maxCooldownTime }} minutes</li>
          <li>Tu peux voir les pseudos, la couleur et les coordonnées x:y de tes voisins directs.
          </li>
          <li>Si tu cliques sur le bouton avec tes coordonnées et ton nom, ta zone sera mise en évidence.</li>
          <li><a target="_blank" href="https://discord.gg/2FQEZZx">Élabores un plan sur discord pour dessiner un <strike>pén</strike>...un soleil en cliquant ici.</a></li>
        </ul>
      </div></AppAlert
      >
    </div>
  </v-app>
</template>

<script>
import fouloscopie from "fouloscopie";
import AppAlert from "~/components/organisms/AppAlert";
import countdown from "@chenfengyuan/vue-countdown";
import {
  DESIRED_FLAG_RATIO,
  getFlagResolutionFromIndexToCoordinateMap,
  mapCoordinatesToTargetRatioRectangleDistribution
} from "../js/ratio-rectangle-distribution";

class Pixel {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  draw() {
    drawPixel(this.x, this.y, this.color, true);
  }
}

//Initialising all the var
let flagWidth, flagHeight;
let flagPixels = [];
let flagIndexToCoordinateCache = [];
let flagPixelMap = new Array(flagWidth);

//Canvas var
let canvasContainer;
let canvas, canvasDrawingContext;
let canvasBoundingBox;

const MIN_ZOOM_LEVEL = 1;
let cameraZoom = 1;
let cameraPositionX = 0;
let cameraPositionY = 0;

//Color from the colorPicker
let canvasPixelColor = "#ff0000";

//the coords of the user's pixel
let userXPixel = 0;
let userYPixel = 0;

let lastUpdate = new Date();

function initializeFlagResolution() {
  flagIndexToCoordinateCache = mapCoordinatesToTargetRatioRectangleDistribution(flagPixels.length, DESIRED_FLAG_RATIO);

  const resolution = getFlagResolutionFromIndexToCoordinateMap(flagIndexToCoordinateCache);
  const hasChanged = flagWidth !== resolution.width || flagHeight !== resolution.height;
  flagWidth = resolution.width;
  flagHeight = resolution.height;

  if (hasChanged) {
    console.log(`flag resolution updated to ${flagWidth}x${flagHeight}`);
  }
  return hasChanged;
}

//Draw EVERY PIXEL of the map given
function drawFlag(pixelMap) {
  canvasDrawingContext.fillRect(cameraPositionX, cameraPositionY, canvas.width*cameraZoom, canvas.height*cameraZoom);
  for (let i = 0; i < pixelMap.length; i++) {
    for (let j = 0; j < pixelMap[i].length; j++) {
      drawPixel(i, j, pixelMap[i][j]);
    }
  }
}

//Draw an overlay to find the user pixel on the whole flag
function drawOverlay() {
  for (let i = 0; i < flagPixelMap.length; i++) {
    for (let j = 0; j < flagPixelMap[0].length; j++) {
      if (!(i == userXPixel && j == userYPixel)) {
        drawPixel(i, j, { hexColor : "#090909e0" });
      }
      }
    }
}

//Draw a pixel on a coord given (x,y,clr), if changetexture is set to true, change the value on the map
//You can change the size and the context to draw, default is flag context
function drawPixel(x, y, pixel, changeTexture = false, size = 1, ctx = canvasDrawingContext) {
  if (ctx && pixel) {
    let drawWidth = (canvas.width / flagWidth) * size;
    let drawHeight = (canvas.height / flagHeight) * size;
    ctx.fillStyle = pixel.hexColor;
    ctx.fillRect(x * drawWidth, y * drawHeight, drawWidth, drawHeight);
    if (changeTexture) {
      flagPixelMap[x][y].hexColor = pixel.hexColor;
    }
    ctx.fillStyle = "#ffffff";
  }
}

//Initalising the flag canvas
function initCanvas() {
  canvasContainer = document.getElementById("flagContainer");
  canvas = document.getElementById("flagCanva");

  canvas.width = canvasContainer.clientWidth;
  canvas.height = ~~(canvas.width / 2);

  canvasBoundingBox = canvas.getBoundingClientRect();
  canvasDrawingContext = canvas.getContext("2d");

  cameraZoom = 1;
  cameraPositionX = 0;
  cameraPositionY = 0;

  drawFlag(flagPixelMap);
}

//Initalising the variables to their value
function init() {
  initCanvas();

  window.addEventListener("resize", onWindowResize);

  canvas.addEventListener("wheel", onWheel);

  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

//Change the color value and draw it to the user pixel
function changeColor(newColor) {
  // console.log("Pixel draw informations :", [newColor, userXPixel, userYPixel]);
  canvasPixelColor = newColor;
  drawPixel(userXPixel, userYPixel, { hexColor : newColor } , true);
}

function getCanvas() {
  return canvas;
}

function setUserPixel(x, y) {
  userXPixel = x;
  userYPixel = y;
}

function onWindowResize() {
  initCanvas();
}

function onWheel(event) {
  event.preventDefault();

  const zoomDelta = event.deltaY * -0.01;
  if (zoomDelta < 0 && cameraZoom <= MIN_ZOOM_LEVEL ||
      zoomDelta > 0 && cameraZoom >= getMaxZoomLevel()) {
    return;
  }

  const oldCameraZoom = cameraZoom;
  cameraZoom += zoomDelta;
  clampCameraScale();

  const oldCameraPositionX = cameraPositionX;
  const oldCameraPositionY = cameraPositionY;
  const mouseX = event.x - canvas.offsetLeft;
  const mouseY = event.y - canvas.offsetTop;
  cameraPositionX += mouseX / oldCameraZoom - mouseX / cameraZoom;
  cameraPositionY += mouseY / oldCameraZoom - mouseY / cameraZoom;
  zoomAndTranslateContext(oldCameraZoom, oldCameraPositionX, oldCameraPositionY, cameraZoom, cameraPositionX, cameraPositionY);
  drawFlag(flagPixelMap);
}

let isMoving = false;
let mouseDragX, mouseDragY;
function onMouseDown(e) {
  isMoving = true;
  mouseDragX = e.clientX;
  mouseDragY = e.clientY;
}
function onMouseMove(e) {
  if (isMoving) {
    const oldCameraPositionX = cameraPositionX;
    const oldCameraPositionY = cameraPositionY;
    cameraPositionX += (mouseDragX - e.clientX) / cameraZoom;
    cameraPositionY += (mouseDragY - e.clientY) / cameraZoom;

    mouseDragX = e.clientX;
    mouseDragY = e.clientY;

    zoomAndTranslateContext(cameraZoom, oldCameraPositionX, oldCameraPositionY, cameraZoom, cameraPositionX, cameraPositionY);

    drawFlag(flagPixelMap);
  }
}
function onMouseUp() {
  isMoving = false;
}

function clampCameraScale() {
  cameraZoom = Math.min(Math.max(cameraZoom, MIN_ZOOM_LEVEL), getMaxZoomLevel());
}

function zoomAndTranslateContext(currentZoom, currentPositionX, currentPositionY, newScale, newPositionX, newPositionY, ctx = canvasDrawingContext) {
  ctx.translate(currentPositionX, currentPositionY);

  const relativeZoom = newScale / currentZoom;
  ctx.scale(relativeZoom, relativeZoom);

  ctx.translate(-newPositionX, -newPositionY);
}

function getMaxZoomLevel() {
  return Math.sqrt(flagPixelMap.length);
}

function getCoordinateFromFlagIndex(index) {
  if (flagIndexToCoordinateCache[index]) {
    return flagIndexToCoordinateCache[index];
  } else {
    console.error('no entry for index', index, flagIndexToCoordinateCache);
    return { x: -1, y: -1 };
  }
}

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return {r, g, b};
}

const getStyle = (color) => {
    const {r, g, b} = hex2rgb(color);
    const brightness = Math.round(((r * 299) +
      (g * 587) +
      (b * 114)) / 1000);
    const textColour = (brightness > 125) ? 'black' : 'white';
    return {
      backgroundColor: color,
      color: textColour
    };
}

import { Chrome } from 'vue-color';

export default {
  name: "edit",
  components: {
    AppAlert,
    countdown,
    'chrome-picker': Chrome,
  },
  data() {
    return {
      doNotShow: false,
      showHelp: true,
      fouloscopieSdk: null,
      topPixel: null,
      leftPixel: null,
      rightPixel: null,
      bottomPixel: null,
      token: undefined,
      color: "#ff0000",
      maxCooldownTime: 5, // min
      lastSubmittedTime: new Date(),
      errorMessage: "",
      openSuccessEditModal: false,
      openFailedEditModal: false,
      x: ~~(Math.random() * flagWidth),
      y: ~~(Math.random() * flagHeight),
      isMounted: false,
    };
  },
  computed: {
    myPixelButtonStyle() {
      return getStyle(this.color);
    },
    topPixelButtonStyle() {
      return getStyle(this.topPixel?.hexColor);
    },
    bottomPixelButtonStyle() {
      return getStyle(this.bottomPixel?.hexColor);
    },
    leftPixelButtonStyle() {
      return getStyle(this.leftPixel?.hexColor);
    },
    rightPixelButtonStyle() {
      return getStyle(this.rightPixel?.hexColor);
    },
    cooldownTime() {
      // return in ms
      const remainingTime =
        this.maxCooldownTime * 60000 -
        (new Date() - new Date(this.lastSubmittedTime));
      console.log("DEBUG - Informations : ", [
        new Date(),
        new Date(this.lastSubmittedTime),
        this.maxCooldownTime,
        new Date() - new Date(this.lastSubmittedTime),
        remainingTime,
      ]);
      return remainingTime;
    },
  },
  methods: {
    closeHelpModal() {
      this.showHelp = false;
      localStorage.setItem('showHelp', 'false');
    },
    closeCooldownModal() {
      this.openFailedEditModal = false;
    },
    closeSuccessfulModal() {
      this.openSuccessEditModal = false;
    },
    change(newColorObject) {
      this.color = newColorObject.hex;
      if (this.isMounted) {
        changeColor(this.color);
      }
    },
    Finish() {
      this.$nuxt.$emit("newTexture", getCanvas());
      this.sendPixel(this.x, this.y);
    },
    Overlay() {
      drawOverlay();
      setTimeout(() => {
        drawFlag(flagPixelMap);
      }, 3000);
    },
    async Refresh(ack = false) {
      console.log("REFRESH", ack);
      console.log("Fetching the flag size");

      await fetch(`${process.env.apiUrl}/flag/after/${lastUpdate.toISOString()}`, {
        method: "GET",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((modifiedPixels) => {
          if (modifiedPixels.length > 0) {
            for (const modifiedPixel of modifiedPixels) {
              flagPixels[modifiedPixel.indexInFlag - 1] = modifiedPixel;
            }

            const hasChanged = initializeFlagResolution();

            for (const modifiedPixel of modifiedPixels) {
              const { x, y } = getCoordinateFromFlagIndex(modifiedPixel.indexInFlag - 1);
              flagPixelMap[x][y] = modifiedPixel;
              if (!hasChanged) {
                drawPixel(x, y, modifiedPixel);
              }
            }

            lastUpdate = new Date();
            this.setNeighboursInfo();

            if (hasChanged) {
              drawFlag();
            }
          }
        })
        .catch((err) => console.log(err));
    },
    async FetchMap() {
      console.log("Fetching the whole map");
      return await fetch(`${process.env.apiUrl}/flag`, {
        method: "GET",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("DEBUG - New map array : ", data);

          flagPixels = [];
          for (const pixel of data) {
            flagPixels[pixel.indexInFlag - 1] = pixel;
          }
          initializeFlagResolution();

          const NEW_MAP = new Array(flagWidth);
          for (let i = 0; i < NEW_MAP.length; i++) {
            NEW_MAP[i] = new Array(flagHeight);
          }

          for (let i = 0; i < data.length; i++) {
            const { x, y } = getCoordinateFromFlagIndex(i);
            NEW_MAP[x][y] = data[i];
          }
          return NEW_MAP;
        })
        .catch((error) => console.log(error));
    },
    async setNeighboursInfo() {
      this.topPixel = await this.getNeighbourPixelIfItExists(this.x, this.y - 1 );
      this.leftPixel = await this.getNeighbourPixelIfItExists(this.x - 1, this.y);
      this.rightPixel = await this.getNeighbourPixelIfItExists(this.x + 1, this.y);
      this.bottomPixel = await this.getNeighbourPixelIfItExists(this.x, this.y + 1 );
      console.log(this.leftPixel);
    },
    async getNeighbourPixelIfItExists(x, y) {
      if (flagPixelMap[x]?.[y]) {
        return {
          ...flagPixelMap[x][y],
          x,
          y,
          username: (await this.fouloscopieSdk.getUser(flagPixelMap[x][y].author)).last_name,
        }
      }
      return null;
    },
    sendPixel(x, y) {
      //Sending the user pixel with coords, color, timestamp?, userID?
      const UserPixel = new Pixel(x, y, flagPixelMap[x][y].hexColor);

      console.log("Sending: ", UserPixel);
      fetch(`${process.env.apiUrl}/pixel`, {
        method: "PUT",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
        body: JSON.stringify({
          hexColor: UserPixel.color,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.retryAfter) {
            this.openFailedEditModal = true;
            this.errorMessage = 'CooldownNotEndedYet';
            /*fetch(`${process.env.apiUrl}/cooldown`, {
              method: "GET",
              crossDomain: true,
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => response.json())
              .then((data) => {
                this.maxCooldownTime = data.cooldown;
              })
              .catch((err) => console.log(err));*/
          } else {
            this.openSuccessEditModal = true;
            this.FetchUserPixel();
            this.FetchMap();
          }
        })
        .catch((error) => console.log(error));
    },
    async FetchUserPixel() {
      console.log("Fetching user pixel");
      await fetch(`${process.env.apiUrl}/pixel`, {
        method: "GET",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.debug("User pixel : ", data);
          const userPixelCoordinates = getCoordinateFromFlagIndex(data.indexInFlag - 1);
          this.x = userPixelCoordinates.x;
          this.y = userPixelCoordinates.y;
          this.color = data.hexColor;
          this.lastSubmittedTime = data.lastUpdate;
          console.debug("time last updated ", this.lastSubmittedTime);
          setUserPixel(this.x, this.y);
          changeColor(this.color);
        })
        .catch((error) => console.log(error));
    },
    async FetchCooldown() {
      const res = await fetch(`${process.env.apiUrl}/cooldown`, {
        method: "GET",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
      });
      const body = await res.json();
      return body.cooldown;
    },
  },
  async mounted() {
    this.showHelp = localStorage.getItem('showHelp') !== 'false';
    this.fouloscopieSdk = await fouloscopie();
    this.token = this.fouloscopieSdk.userInfo.token;
    this.maxCooldownTime = await this.FetchCooldown();
    await this.FetchUserPixel();
    flagPixelMap = await this.FetchMap();
    this.setNeighboursInfo();
    init();
    this.isMounted = true;
    this.flagRefreshIntervalId = setInterval(async () => {
      await this.Refresh();
    }, 30000)
  },
  async middleware({ redirect }) {
    const instance = await fouloscopie();
    const token = instance.userInfo.token;
    // console.log("DEBUG - userToken : ", token);
    if (!token) {
      redirect({ name: "index" });
    }
  },
  beforeDestroy() {
    clearInterval(this.flagRefreshIntervalId);
  },
};
</script>


<style>
.vc-chrome-saturation-wrap {
  padding-bottom: 30% !important;
}

.vc-alpha {
  display: none;
}

.vc-chrome-fields:last-child {
  display: none;
}

.vc-checkerboard {
  display: none;
}

.vc-chrome-active-color, .vc-hue-picker, .vc-hue-pointer {
  z-index: 0 !important;
}

.pixelButton {
  max-width: 200px;
  height: 100%;
}

.pixelButton span {
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
