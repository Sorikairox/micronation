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
          class="flex flex-col items-center px-4 py-1 mx-4 mb-auto bg-white rounded-lg "
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
    </div>
  </v-app>
</template>

<script>
import * as THREE from "three";
import fouloscopie from "fouloscopie";

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

//Initalising the MAP
// for (let i = 0; i < MAP_BASE.length; i++) {
//   MAP_BASE[i] = new Array(yPixel);
// }

// //Seting the color (here is a french flag)
// for (let i = 0; i < MAP_BASE.length; i++) {
//   for (let j = 0; j < MAP_BASE[0].length; j++) {
//     if (i < MAP_BASE.length / 3) {
//       MAP_BASE[i][j] = "#0000ff";
//     } else if (i < MAP_BASE.length / 1.5) {
//       MAP_BASE[i][j] = "#00ff00";
//     } else {
//       MAP_BASE[i][j] = "#ff0000";
//     }
//   }
// }

//Draw EVERY PIXEL of the map given
function drawFlag(MAP) {
  for (let i = 0; i < MAP.length; i++) {
    for (let j = 0; j < MAP[0].length; j++) {
      drawPixel(i, j, MAP[i][j]);
    }
  }
}

//Draw a grid, usefull for debuging but can bug
function drawGrid() {
  for (let i = 0; i < MAP_BASE.length; i++) {
    for (let j = 0; j < MAP_BASE[0].length; j++) {
      if (i % 8 == 0) {
        MAP_BASE[i][j] = "#ff00ff";
      }
      if (j % 8 == 0) {
        MAP_BASE[i][j] = "#ff00ff";
      }
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

  // drawGrid()
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
  canvas.addEventListener("pointerdown", onPointerDown, false);
}

//Change the color value and draw it to the user pixel
function changeColor(newColor) {
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
  drawPixel(
    ~~(((mouse.x + 1) * xPixel) / 2),
    ~~(((-mouse.y + 1) * yPixel) / 2),
    color,
    true
  );
  drawZoom(~~(((mouse.x + 1) * WIDTH) / 2), ~~(((-mouse.y + 1) * HEIGHT) / 2));
}

function onPointerMove(e) {
  mouse.y = -((e.clientY - BoundingBox.top) / HEIGHT) * 2 + 1;
  mouse.x = ((e.clientX - BoundingBox.left) / WIDTH) * 2 - 1;
  drawZoom(~~(((mouse.x + 1) * WIDTH) / 2), ~~(((-mouse.y + 1) * HEIGHT) / 2));
}

export default {
  name: "edit",
  data() {
    return {
      token:
        // dev purpose, had to dealt with preprod problems so a temporary working token was taking as a debugging base
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExOTVmYzE4LTk5MDktNDIyNC1iNDg5LWUxZGM3YTBjNjM1YyIsImlhdCI6MTYzMTE0NTcwOCwiZXhwIjoxNjMxMTQ2NjA4fQ.Ow0pVEYXaRC-zpsdxtg5MfZa0JJAoODzar1orIKalM8",
      pixelId: undefined,
      color: "0000ff",
      openSuccessEditModal: false,
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
  methods: {
    change() {
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
        drawFlag(MAP_BASE);
        drawZoom();
      }, 3000);
    },
    Refresh(ack = false) {
      console.log("REFRESH", ack);
      console.log("Fetching the flag size");

      let newX = xPixel,
        newY = yPixel;
      fetch(`${process.env.apiUrl}/flag`, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authentication: this.token,
        },
        body: JSON.stringify({
          pixelId: this.pixelId,
          hexColor: this.color,
        }),
      })
        .then((data) => {
          data = JSON.stringify(data);
          newX = data.body.length;
          newY = data.body[0].length;
        })
        .catch((err) => console.log(err));
      //for test, remove thx to back end
      /*if (ack) {
        newX = ~~(TEST + Math.random() * TEST);
        newY = ~~(newX / 2);
        console.log("New size", newX, newY);
      }*/
      fetch();

      if (xPixel != newX || yPixel != newY) {
        console.log("Many users, new flag, drawing...");
        xPixel = newX;
        yPixel = newY;
        MAP_BASE = this.FetchMap();
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
      const NEW_PIXEL = [];
      for (let i = 0; i < (Math.random() * xPixel * yPixel) / 2; i++) {
        NEW_PIXEL.push(
          new Pixel(
            ~~(Math.random() * xPixel),
            ~~(Math.random() * yPixel),
            "#ff00ff"
          )
        );
      }
      return NEW_PIXEL;
    },
    FetchMap() {
      console.log("Fetching the whole map");

      fetch(`${process.env.apiUrl}/flag`, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authentication: this.token,
        },
        body: JSON.stringify({
          pixelId: this.pixelId,
          hexColor: this.color,
        }),
      })
        .then((data) => {
          data = JSON.stringify(data);
          xPixel = data.body.length;
          yPixel = data.body[0].length;
          const NEW_MAP = new Array(xPixel);
          for (let i = 0; i < NEW_MAP.length; i++) {
            NEW_MAP[i] = new Array(yPixel);
          }

          for (let i = 0; i < NEW_MAP.length; i++) {
            for (let j = 0; j < NEW_MAP[0].length; j++) {
              NEW_MAP[i][j] = data.body[i][j].hexColor;
            }
          }
        })
        .catch((error) => console.log(error));

      const NEW_MAP = new Array(xPixel);
      for (let i = 0; i < NEW_MAP.length; i++) {
        NEW_MAP[i] = new Array(yPixel);
      }

      //Seting the color (here is a french flag)
      for (let i = 0; i < NEW_MAP.length; i++) {
        for (let j = 0; j < NEW_MAP[0].length; j++) {
          /*if (j < 100) {
            if (i < 200 / 3) {
              NEW_MAP[i][j] = "#0000ff";
            } else if (i < 400 / 3) {
              NEW_MAP[i][j] = "#00ff00";
            } else if (i < 200) {
              NEW_MAP[i][j] = "#ff0000";
            }
          } else {
            NEW_MAP[i][j] = "#ffff00";
          }*/
          NEW_MAP[i][j];
        }
      }
      return NEW_MAP;
    },
    sendPixel(x, y) {
      //Sending the user pixel with coords, color, timestamp?, userID?
      const UserPixel = new Pixel(x, y, MAP_BASE[x][y]);

      console.log("Sending: ", UserPixel);
      fetch(`${process.env.apiUrl}/pixel`, {
        method: "PUT",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authentication: this.token,
        },
        body: JSON.stringify({
          pixelId: this.pixelId,
          hexColor: this.color,
        }),
      })
        .then((data) => {
          this.openSuccessEditModal = true;
        })
        .catch((error) => console.log(error));
    },
    FetchUserPixel() {
      console.log("Fetching user pixel");
      fetch(`${process.env.apiUrl}/pixel`, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
          Authentication: this.token,
        },
      })
        .then((data) => {
          data = JSON.stringify(data);
          this.x = data.body.indexInFlag / xPixel;
          this.y = data.body.indexInFlag % yPixel;
          this.pixelId = data.body.entityId;
        })
        .catch((error) => console.log(error));
    },
  },
  mounted() {
    this.isMounted = true;
    MAP_BASE = this.FetchMap();
    this.FetchUserPixel();
    setUserPixel(this.x, this.y);
    init();
  },
  async middleware({ redirect }) {
    const instance = await fouloscopie();
    const token = instance.userToken;
    console.log(token);
    if (!token) {
      // commented out for debug purpose on this page, especially on the fetchs
      // redirect({ name: "index" });
    } else {
      this.token = token;
    }
  },
};
</script>

<style></style>
