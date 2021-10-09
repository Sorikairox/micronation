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
        "
      >
        <div
          id="flagContainer"
          class="
            flex-1 md:self-center
            m-2 md:mx-4 md:mb-4
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
        >
            <div class="flex flex-col justify-between flex-1">
              <div class="flex justify-center">
                <AppButton v-if="topPixel !== null"
                  size="medium"
                  class="text-white my-auto pixelButton"
                           v-bind:style="{ backgroundColor: topPixel.hexColor }"
                >
                  Le pixel de {{topPixel.username}} en {{topPixel.x}} : {{topPixel.y}}
                </AppButton>
              </div>
              <div class="flex justify-between">
                <AppButton v-if="leftPixel !== null"
                           size="medium"
                           class="text-white my-auto pixelButton"
                           v-bind:style="{ backgroundColor: leftPixel.hexColor }"
                >
                  Le pixel de {{leftPixel.username}} en {{leftPixel.x}} : {{leftPixel.y}}
                </AppButton>
                <AppButton
                  size="medium"
                  v-on:click="Overlay()"
                  class="text-white my-auto pixelButton"
                  :style="myPixelButtonStyle"
                >
                  Ton pixel en {{ x + 1 }}:{{ y + 1 }}
                </AppButton>
                <AppButton v-if="rightPixel !== null"
                           size="medium"
                           class="text-white my-auto pixelButton"
                           v-bind:style="{ backgroundColor: rightPixel.hexColor }"
                >
                  Le pixel de {{rightPixel.username}} en {{rightPixel.x}} : {{rightPixel.y}}
                </AppButton>
              </div>
              <div class="flex justify-center">
                <AppButton v-if="bottomPixel !== null"
                           size="medium"
                           class="text-white my-auto pixelButton"
                           v-bind:style="{ backgroundColor: bottomPixel.hexColor }"
                >
                  Le pixel de {{bottomPixel.username}} en {{bottomPixel.x}} : {{bottomPixel.y}}
                </AppButton>
              </div>
            </div>
            <hr class="mt-4 border-grey-light">
            <div class="flex flex-col">
              <h1 class="m-4">Modifier la couleur de votre pixel</h1>
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
        >La date de dernière modification de votre pixel est trop récente,
        veuillez patienter ! <br />
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
    </div>
  </v-app>
</template>

<script>
import * as THREE from "three";
import fouloscopie from "fouloscopie";
import AppAlert from "~/components/organisms/AppAlert";
import countdown from "@chenfengyuan/vue-countdown";

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
let desiredFlagWidth = 500;
let flagWidth = desiredFlagWidth;
let flagHeight;
let flagPixelMap = new Array(flagWidth);

const mousePosition = new THREE.Vector2();

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
let pixelNumber = 0;

function set2DSizeFromPixelNumber(length) {
  flagWidth =
    length > desiredFlagWidth ? desiredFlagWidth : length;
  flagHeight =
    length > desiredFlagWidth
      ? Math.ceil(length / desiredFlagWidth)
      : 1;
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
        drawPixel(i, j, "#090909e0");
      }
    }
  }
}

//Draw a pixel on a coord given (x,y,clr), if changetexture is set to true, change the value on the map
//You can change the size and the context to draw, default is flag context
function drawPixel(x, y, pixel, changeTexture = false, size = 1, ctx = canvasDrawingContext) {
  if (ctx) {
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

function getCoordinateFromFlagIndex(i) {
  let x = i % flagWidth;
  let y = Math.floor(i / desiredFlagWidth);
  return { x, y };
}

function getFlagIndexFromCoordinates(x, y) {
  return y * desiredFlagWidth + x;
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
      return {
        backgroundColor: this.color
      }
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
        .then((data) => {
          for (const modifiedPixel of data) {
            const { x, y } = getCoordinateFromFlagIndex(
              modifiedPixel.indexInFlag
            );
            if (!flagPixelMap[x][y]) {
              pixelNumber++;
            }
            flagPixelMap[x][y] = modifiedPixel;
          }
          lastUpdate = new Date();
          set2DSizeFromPixelNumber(pixelNumber);
          drawFlag(flagPixelMap);
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

          set2DSizeFromPixelNumber(data.length);
          pixelNumber = data.length;
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
    },
    async getNeighbourPixelIfItExists(x, y) {
      if (FLAG[x]?.[y]) {
        return {
        ...FLAG[x][y],
          username: (await this.fouloscopieSdk.api.items('directus_users').readOne(FLAG[x][y].author)).username,
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
          if (data.statusCode && data.statusCode != 200) {
            this.openFailedEditModal = true;
            this.errorMessage = data?.message;
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
          console.log("DEBUG - User pixel : ", data);
          // field indexInFlag not in the response of the /pixel endpoint, the back-end has been contacted to discuss this issue
          this.x = (data.indexInFlag % desiredFlagWidth) - 1;
          this.y = ~~(data.indexInFlag / desiredFlagWidth);
          this.color = data.hexColor;
          this.lastSubmittedTime = data.lastUpdate;
          console.log("DEBUG - time last updated ", this.lastSubmittedTime);
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
    this.fouloscopieSdk = await fouloscopie();
    this.token = this.fouloscopieSdk.userInfo.token;
    this.maxCooldownTime = await this.FetchCooldown();
    await this.FetchUserPixel();
    flagPixelMap = await this.FetchMap();
    this.setNeighboursInfo();
    init();
    this.isMounted = true;
    setInterval(async () => {
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

.pixelButton span {
  mix-blend-mode: difference;
}
</style>
