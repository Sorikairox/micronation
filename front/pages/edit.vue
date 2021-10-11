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
          <div>
            <div id="zoomContainer" class="w-full mt-4 h-1/2">
              <canvas
                id="zoomCanva"
                class="border-2 rounded-md border-grey-dark"
              />
            </div>
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
            <div class="flex flex-1 m-4 justify-center">
              <AppButton
                size="medium"
                v-on:click="Overlay()"
                class="text-white my-auto"
                :style="myPixelButtonStyle"
              >
                Votre pixel: {{ x + 1 }}:{{ y + 1 }}
              </AppButton>
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
let desired_flag_width = 500;
let xPixel = desired_flag_width;
let yPixel;
let FLAG = new Array(xPixel);

const mouse = new THREE.Vector2();

//Canvas var
let container, WIDTH, HEIGHT;
let canvas, context;
let zoomContainer;
let zoomCanvas, zoomContext;
let BoundingBox;

//Color from the colorPicker
let canvasPixelColor = "#ff0000";

//the coords of the user's pixel
let userXPixel = 0;
let userYPixel = 0;

//offset for centering the zoomCanva
let Xoffset,
  Yoffset,
  zoom = 2;

let lastUpdate = new Date();
let pixelNumber = 0;

function set2DSizeFromPixelNumber(length) {
  xPixel =
    length > desired_flag_width ? desired_flag_width : length;
  yPixel =
    length > desired_flag_width
      ? Math.ceil(length / desired_flag_width)
      : 1;
}

//Draw EVERY PIXEL of the map given
function drawFlag(MAP) {
  for (let i = 0; i < MAP.length; i++) {
    for (let j = 0; j < MAP[i].length; j++) {
      drawPixel(i, j, MAP[i][j]);
    }
  }
}

//Draw an overlay to find the user pixel on the whole flag
function drawOverlay() {
  for (let i = 0; i < FLAG.length; i++) {
    for (let j = 0; j < FLAG[0].length; j++) {
      if (!(i == userXPixel && j == userYPixel)) {
        drawPixel(i, j, "#090909e0");
      }
    }
  }
  drawZoom();
}

//Draw a pixel on a coord given (x,y,clr), if changetexture is set to true, change the value on the map
//You can change the size and the context to draw, default is flag context
function drawPixel(x, y, clr, changeTexture = false, size = 1, ctx = context) {
  if (ctx) {
    let xDrawSize = (WIDTH / xPixel) * size;
    let yDrawSize = (HEIGHT / yPixel) * size;
    ctx.fillStyle = clr;
    ctx.fillRect(x * xDrawSize, y * yDrawSize, xDrawSize + 1, yDrawSize + 1);
    if (changeTexture) {
      FLAG[x][y] = clr;
    }
    ctx.fillStyle = "#ffffff";
  }
}

//Initalising the flag canvas
function initCanvas() {
  container = document.getElementById("flagContainer");
  canvas = document.getElementById("flagCanva");

  canvas.width = WIDTH = container.clientWidth;
  canvas.height = HEIGHT = ~~(WIDTH / 2);

  BoundingBox = canvas.getBoundingClientRect();
  context = canvas.getContext("2d");

  drawFlag(FLAG);
}

//Initalising the zoom canvas
function initZoom() {
  zoomContainer = document.getElementById("zoomContainer");
  zoomCanvas = document.getElementById("zoomCanva");
  zoomCanvas.width = zoomContainer.clientWidth / 2;
  zoomCanvas.height = zoomCanvas.width / 2;

  zoomContext = zoomCanvas.getContext("2d");
  Xoffset = zoomCanvas.width / (2 * zoom);
  Yoffset = zoomCanvas.height / (2 * zoom);

  drawZoom();
}

//Draw the zoom canvas (use the flag canvas and zoom it)
function drawZoom(
  x = (userXPixel * WIDTH) / xPixel,
  y = (userYPixel * HEIGHT) / yPixel
) {
  x - Xoffset < 0
    ? (x = 0)
    : x + Xoffset > WIDTH
    ? (x = WIDTH - 2 * Xoffset)
    : (x -= Xoffset);
  y - Yoffset < 0
    ? (y = 0)
    : y + Yoffset > HEIGHT
    ? (y = HEIGHT - 2 * Yoffset)
    : (y -= Yoffset);
  if (zoomContext) {
    zoomContext.drawImage(
      canvas,
      x,
      y,
      zoomCanvas.width / zoom,
      zoomCanvas.height / zoom,
      0,
      0,
      zoomCanvas.width,
      zoomCanvas.height
    );
  }
}

//Initalising the variables to their value
function init() {
  initCanvas();
  initZoom();

  window.addEventListener("resize", onWindowResize);
  canvas.addEventListener("pointermove", onPointerMove, false);
}

//Change the color value and draw it to the user pixel
function changeColor(newColor) {
  // console.log("Pixel draw informations :", [newColor, userXPixel, userYPixel]);
  canvasPixelColor = newColor;
  drawPixel(userXPixel, userYPixel, newColor, true);
  drawZoom();
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
  initZoom();
}

function onPointerMove(e) {
  mouse.y = -((e.clientY - BoundingBox.top) / HEIGHT) * 2 + 1;
  mouse.x = ((e.clientX - BoundingBox.left) / WIDTH) * 2 - 1;
  drawZoom(~~(((mouse.x + 1) * WIDTH) / 2), ~~(((-mouse.y + 1) * HEIGHT) / 2));
}

function getCoordinateFromFlagIndex(i) {
  let x = i % xPixel;
  let y = Math.floor(i / desired_flag_width);
  return { x, y };
}

function getFlagIndexFromCoordinates(x, y) {
  return y * desired_flag_width + x;
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
      token: undefined,
      color: "#ff0000",
      maxCooldownTime: 5, // min
      lastSubmittedTime: new Date(),
      errorMessage: "",
      openSuccessEditModal: false,
      openFailedEditModal: false,
      x: ~~(Math.random() * xPixel),
      y: ~~(Math.random() * yPixel),
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
        drawFlag(FLAG);
        drawZoom();
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
            if (!FLAG[x][y]) {
              pixelNumber++;
            }
            FLAG[x][y] = modifiedPixel.hexColor;
          }
          lastUpdate = new Date();
          set2DSizeFromPixelNumber(pixelNumber);
          initCanvas();
          initZoom();
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
          const NEW_MAP = new Array(xPixel);
          for (let i = 0; i < NEW_MAP.length; i++) {
            NEW_MAP[i] = new Array(yPixel);
          }

          for (let i = 0; i < data.length; i++) {
            const { x, y } = getCoordinateFromFlagIndex(i);
            NEW_MAP[x][y] = data[i].hexColor;
          }
          return NEW_MAP;
        })
        .catch((error) => console.log(error));
    },
    sendPixel(x, y) {
      //Sending the user pixel with coords, color, timestamp?, userID?
      const UserPixel = new Pixel(x, y, FLAG[x][y]);

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
          this.x = (data.indexInFlag % desired_flag_width) - 1;
          this.y = ~~(data.indexInFlag / desired_flag_width);
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
    const instance = await fouloscopie();
    this.token = instance.userInfo.token;
    this.maxCooldownTime = await this.FetchCooldown();
    await this.FetchUserPixel();
    FLAG = await this.FetchMap();
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
</style>
