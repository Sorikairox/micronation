<template>
  <v-app>
    <div class="w-screen h-screen bg-grey-light">
      <div
        class="grid h-full grid-rows-2 pt-24 space-y-8 lg:grid-cols-2 lg:space-x-8"
      >
        <div
          id="flagContainer"
          class="flex flex-col justify-center w-3/4 mx-auto bg-white rounded-lg sm:mx-4 sm:w-full"
        >
          <canvas
            id="flagCanva"
            class="mx-auto border-2 rounded-md border-grey-dark"
          />
        </div>
        <div
          class="flex flex-col items-center px-4 py-1 mx-4 mb-auto mt-0 bg-white rounded-lg "
        >
          <div
            class="flex flex-col items-center w-full h-full pb-4 mb-4 border-b-2 sm:flex-row justify-evenly border-grey-base"
          >
            <div class="flex flex-col justify-around h-96">
              <AppButton
                size="medium"
                v-on:click="Overlay()"
                variant="contained"
                class="bg-primary-dark"
              >
                Votre pixel: {{ x }}:{{ y }}
              </AppButton>
              <AppButton
                size="medium"
                v-on:click="Refresh()"
                variant="contained"
                class="bg-primary-dark"
              >
                Actualiser map
              </AppButton>
              <AppButton
                size="medium"
                v-on:click="Refresh(true)"
                variant="contained"
                class="bg-primary-dark"
              >
                Actualiser size
              </AppButton>
              <AppButton
                size="medium"
                v-on:click="Finish()"
                variant="contained"
                class="bg-primary-dark"
              >
                Valider
              </AppButton>
            </div>
            <div
              class="flex flex-col items-center justify-center w-auto mx-auto sm:w-1/2 sm:mx-0"
            >
              <v-color-picker
                v-model="color"
                :swatches="swatches"
                show-swatches
                :elevation="5"
                @update:color="change()"
              ></v-color-picker>
            </div>
          </div>
          <div id="zoomContainer" class="w-full h-2/6">
            <canvas
              id="zoomCanva"
              class="m-auto border-2 rounded-md border-grey-dark"
            />
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
        >La couleur (
        <pre>{{ this.color.hex }}</pre>
        ) a été changée avec succès !</AppAlert
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
const ratio = 2 / 1;
const TEST = 200;
let xPixel = TEST;
let yPixel = ~~(xPixel / ratio);
let MAP_BASE = new Array(xPixel);

const mouse = new THREE.Vector2();

//Canvas var
let container, WIDTH, HEIGHT;
let canvas, context;
let zoomContainer;
let zoomCanvas, zoomContext;
let BoundingBox;

//Color from the colorPicker
let color = "#ff0000";

//the coords of the user's pixel
let userXPixel = 0;
let userYPixel = 0;

//offset for centering the zoomCanva
let Xoffset,
  Yoffset,
  zoom = 2;

//Draw EVERY PIXEL of the map given
function drawFlag(MAP) {
  for (let i = 0; i < MAP.length; i++) {
    for (let j = 0; j < MAP[0].length; j++) {
      drawPixel(i, j, MAP[i][j]);
    }
  }
}

//Draw an overlay to find the user pixel on the whole flag
function drawOverlay() {
  for (let i = 0; i < MAP_BASE.length; i++) {
    for (let j = 0; j < MAP_BASE[0].length; j++) {
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
  let drawSize = (WIDTH / xPixel) * size;
  ctx.fillStyle = clr;
  ctx.fillRect(x * drawSize, y * drawSize, drawSize + 1, drawSize + 1);
  if (changeTexture) {
    MAP_BASE[x][y] = clr;
  }
  ctx.fillStyle = "#ffffff";
}

//Initalising the flag canvas
function initCanvas() {
  container = document.getElementById("flagContainer");
  canvas = document.getElementById("flagCanva");

  WIDTH = container.clientWidth * 0.95;
  HEIGHT = ~~(WIDTH / 2);
  if (HEIGHT + 8 > container.clientHeight) {
    HEIGHT = container.clientHeight * 0.95;
    WIDTH = HEIGHT * 2;
  }

  canvas.height = HEIGHT;
  canvas.width = WIDTH;
  BoundingBox = canvas.getBoundingClientRect();
  context = canvas.getContext("2d");

  drawFlag(MAP_BASE);
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

//Initalising the variables to their value
function init() {
  initCanvas();
  initZoom();

  window.addEventListener("resize", onWindowResize);
  canvas.addEventListener("pointermove", onPointerMove, false);
}

//Change the color value and draw it to the user pixel
function changeColor(newColor) {
  console.log("Pixel draw informations :", [newColor, userXPixel, userYPixel]);
  drawPixel(userXPixel, userYPixel, newColor, true);
  color = newColor;
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

//Draw a pixel on the pointer's coords
function onPointerDown(event) {
  drawZoom(~~(((mouse.x + 1) * WIDTH) / 2), ~~(((-mouse.y + 1) * HEIGHT) / 2));
}

function onPointerMove(e) {
  mouse.y = -((e.clientY - BoundingBox.top) / HEIGHT) * 2 + 1;
  mouse.x = ((e.clientX - BoundingBox.left) / WIDTH) * 2 - 1;
  drawZoom(~~(((mouse.x + 1) * WIDTH) / 2), ~~(((-mouse.y + 1) * HEIGHT) / 2));
}

export default {
  name: "edit",
  components: {
    AppAlert,
    countdown,
  },
  data() {
    return {
      token: undefined,
      color: {
        hex: "00ffff",
      },
      maxCooldownTime: 5, // min
      lastSubmittedTime: new Date(),
      errorMessage: "",
      openSuccessEditModal: false,
      openFailedEditModal: false,
      x: ~~(Math.random() * xPixel),
      y: ~~(Math.random() * yPixel),
      isMounted: false,
      swatches: [
        ["#FF0000", "#AA0000", "#550000"],
        ["#FFFF00", "#AAAA00", "#555500"],
        ["#00FF00", "#00AA00", "#005500"],
        ["#00FFFF", "#00AAAA", "#005555"],
        ["#0000FF", "#0000AA", "#000055"],
      ],
    };
  },
  computed: {
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
    change() {
      if (this.isMounted) {
        changeColor(this.color.hex);
      }
    },
    Finish() {
      this.$nuxt.$emit("newTexture", getCanvas());
      this.sendPixel(this.x, this.y);
    },
    Overlay() {
      drawOverlay();
      setTimeout(() => {
        drawFlag(MAP_BASE);
        drawZoom();
      }, 3000);
    },
    async Refresh(ack = false) {
      console.log("REFRESH", ack);
      console.log("Fetching the flag size");

      let newX = xPixel,
        newY = yPixel;
      fetch(`${process.env.apiUrl}/flag`, {
        method: "GET",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          newX = data.length;
          console.log("DEBUG - size of flag : ", newX);
          newY = ~~(newX / ratio);
        })
        .catch((err) => console.log(err));

      if (xPixel != newX || yPixel != newY) {
        console.log("Many users, new flag, drawing...");
        xPixel = newX;
        yPixel = newY;
        MAP_BASE = await this.FetchMap();
        initCanvas();
        initZoom();
      } else {
        //Fetch only new pixels
        this.FetchPixels().forEach((pixel) => {
          pixel.draw();
        });
      }

      drawZoom();
    },
    FetchPixels() {
      console.log("Fetching the new pixel");
      // TOFIX : how to fetch the new pixels from a back purpose ? We can only use the /flag endpoint to get all the pixels, not just the recent one
      // One way : fetching all the pixels and looking out the new compared to the actual map we have, maybe using the "entityId" field
      const NEW_PIXEL = [];
      // for (let i = 0; i < (Math.random() * xPixel * yPixel) / 2; i++) {
      //   NEW_PIXEL.push(
      //     new Pixel(
      //       ~~(Math.random() * xPixel),
      //       ~~(Math.random() * yPixel),
      //       "#ff00ff"
      //     )
      //   );
      // }
      return NEW_PIXEL;
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
          xPixel = 20;
          yPixel = ~~(xPixel / ratio);
          const NEW_MAP = new Array(xPixel);
          for (let i = 0; i < NEW_MAP.length; i++) {
            NEW_MAP[i] = new Array(yPixel);
          }

          for (let i = 0; i < data.length; i++) {
            let j = i % xPixel;
            let k = ~~(i / yPixel);
            NEW_MAP[j][k] = data[i].hexColor;
          }
          return NEW_MAP;
        })
        .catch((error) => console.log(error));
    },
    sendPixel(x, y) {
      //Sending the user pixel with coords, color, timestamp?, userID?
      const UserPixel = new Pixel(x, y, MAP_BASE[x][y]);

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
          this.x = (data.indexInFlag % xPixel) - 1;
          this.y = ~~(data.indexInFlag / yPixel);
          this.color = {
            hex: data.hexColor,
          };
          this.lastSubmittedTime = data.lastUpdate;
          console.log("DEBUG - time last updated ", this.lastSubmittedTime);
          setUserPixel(this.x, this.y);
          changeColor(this.color.hex);
        })
        .catch((error) => console.log(error));
    },
    async FetchCooldown() {
      const res = await fetch(`${process.env.apiUrl}/cooldown`,
        {
          method: "GET",
          crossDomain: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: this.token,
          },
        });
      const body = await res.json();
      return body.cooldown;
    }
  },
  async mounted() {
    const instance = await fouloscopie();
    this.token = instance.userInfo.token;
    this.maxCooldownTime = await this.FetchCooldown();
    MAP_BASE = await this.FetchMap();
    await this.FetchUserPixel();
    init();
    this.isMounted = true;
  },
  async middleware({ redirect }) {
    const instance = await fouloscopie();
    const token = instance.userInfo.token;
    console.log("DEBUG - userToken : ", token);
    if (!token) {
      redirect({ name: "index" });
    }
  },
};
</script>

<style></style>
