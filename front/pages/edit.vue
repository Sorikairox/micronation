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
          <div class="relative rounded-md overflow-hidden" style="border: 1px solid #ccc">
            <canvas
              id="flagCanva"
              class="w-full border-grey-dark"
              @mousemove="updateHoveredPixel"
              @click="setPixelToEditFromHover"
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
        <div
          id="sidePanel"
          class="
            flex flex-col
            m-2 md:m-4 md:ml-0
            p-4
            bg-white
            rounded-lg
            h-100
            justify-between
          "
        >
          <div class="flex-col flex-1 flex justify-start relative">
            <button
              v-on:click="showHelp = true"
              class="cursor-pointer w-8 h-8 p-1 absolute right-0 top-0 hover:text-grey-light"
            >
              <AppHelpIcon/>
            </button>

            <div class="pr-10 property-list">
              <div><span class="property-name">Voisin de gauche :</span> <span v-if="leftPixel">[{{leftPixel.x + 1}}:{{leftPixel.y + 1}}] {{leftPixel.username}} </span><span v-else>Pas de voisin</span></div>
              <div><span class="property-name">Voisin du haut :</span> <span v-if="topPixel">[{{topPixel.x + 1}}:{{topPixel.y + 1}}] {{topPixel.username}} </span><span v-else>Pas de voisin</span></div>
              <div><span class="property-name">Voisin de droite :</span> <span v-if="rightPixel">[{{rightPixel.x + 1}}:{{rightPixel.y + 1}}] {{rightPixel.username}}</span><span v-else>Pas de voisin</span></div>
              <div><span class="property-name">Voisin du bas :</span> <span v-if="bottomPixel">[{{bottomPixel.x + 1}}:{{bottomPixel.y + 1}}] {{bottomPixel.username}} </span><span v-else>Pas de voisin</span></div>
            </div>

            <AppButton
              size="small"
              v-on:click="Overlay()"
              class="my-2 bg-positive-base"
            >
              <template v-slot:icon><AppPlaceIcon/></template>
              Où est ma zone [{{ x + 1 }}:{{ y + 1 }}] ?
            </AppButton>

            <hr class="mt-1 border-grey-light">
          </div>
          <div class="flex flex-col text-center">
            <h1 class="m-4">
              <div v-if="editedPixel" class="property-list">
                <div><span class="property-name">Zone :</span> [{{ editedPixel.x + 1 }}:{{ editedPixel.y + 1 }}]</div>
                <div><span class="property-name">Propriétaire :</span> {{ editedPixel.authorName || editedPixel.author }}</div>
              </div>
              <span v-if="!editedPixel">Pas de zone sélectionnée</span>
            </h1>
            <div class="flex mb-2 justify-between items-center">
              <span class="p-2">x:</span>
              <input
                class="flex-grow number-input inline-block rounded p-2"
                type="number"
                step="1"
                v-model="modifiedPixelX"
                @change="setPixelToEditFromCoordinates"
              >
              <span class="p-2">y:</span>
              <input
                class="flex-grow number-input inline-block rounded p-2"
                type="number"
                step="1"
                v-model="modifiedPixelY"
                @change="setPixelToEditFromCoordinates"
              >
            </div>
            <chrome-picker style="width: 100%;height: auto" v-model="color" @input="change"></chrome-picker>
            <AppButton
                       size="medium"
                       v-on:click="Finish()"
                       variant="contained"
                       class="bg-primary-dark mt-4"
                       :disabled="requesting || !editedPixel"
            >
              <template v-slot:icon v-if="!requesting"><AppDoneIcon/></template>
              <span v-if="!requesting">Modifier la couleur de la zone<span v-if="editedPixel"> [{{editedPixel.x + 1}}:{{editedPixel.y + 1}}]</span></span>
              <div v-if="requesting" class="loader"></div>
            </AppButton>
          </div>
        </div>
      </div>
      <AppAlert
        v-if="this.errorMessage == 'CooldownNotEndedYet'"
        variant="error"
        @close="closeCooldownModal"
        :open="openFailedEditModal"
        >La date de dernière modification de ta zone est trop récente,
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
        <p>Vous allez prendre part à une expérience de dessin collectif. L’objectif de cette expérience est de produire le drapeau d’une micronation virtuelle !
          <a href="https://www.youtube.com/watch?v=ehmyaX0lJew">(Il est vivement recommandé de regarder la vidéo de Dirty Biology avant pour mieux comprendre de quoi il s’agit).</a></p>
        <p>Voici les règles du jeu : </p>
        <ol>
          <li>(1) Chaque participant contrôle la couleur d’une seule zone du drapeau. Plus il y a de monde, plus les zones individuelles seront petites ! </li>
          <li>(2) Cliquez sur le bouton "Où est ma zone ?" pour visualiser la zone qui vous a été attribuée. Elle sera indiquée en surbrillance.</li>
          <li>(3) Vous pouvez modifier la couleur de votre zone comme vous le souhaitez, mais seulement une fois toutes les
            {{ maxCooldownTime }} minutes et uniquement pour votre zone.</li>
          <li><a target="_blank" href="https://discord.gg/rhz4hW6D">Élabores un plan sur discord avec tes voisins en cliquant ici.</a></li>
        </ol>
      </div></AppAlert
      >
    </div>
  </v-app>
</template>

<script>
import fouloscopie from "fouloscopie";
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

let indexInFlagToLocalIndexMap = {};

function initializeFlagResolution() {
  flagIndexToCoordinateCache = mapCoordinatesToTargetRatioRectangleDistribution(flagPixels.length, DESIRED_FLAG_RATIO);

  const resolution = getFlagResolutionFromIndexToCoordinateMap(flagIndexToCoordinateCache);
  const hasChanged = flagWidth !== resolution.width || flagHeight !== resolution.height;
  flagWidth = resolution.width;
  flagHeight = resolution.height;
  return hasChanged;
}

//Draw EVERY PIXEL of the map given
function drawFlag(pixelMap) {
  canvasDrawingContext.fillStyle = '#fff';
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
      } else {
        drawPixel(i, j, { hexColor : "#00ff16" });
      }
      }
    }
}

//Draw a pixel on a coord given (x,y,clr), if changetexture is set to true, change the value on the map
//You can change the size and the context to draw, default is flag context
function drawPixel(x, y, pixel, changeTexture = false, size = 1, ctx = canvasDrawingContext) {
  if (ctx && pixel?.hexColor) {
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

  canvas.addEventListener("mousedown", initFlagDrag);
  window.addEventListener("mousemove", dragFlag);
  window.addEventListener("mouseup", endFlagDrag);
}

//Change the color value and draw it to the user pixel
function changeColor(x, y, newColor) {
  // // console.log("Pixel draw informations :", [newColor, userXPixel, userYPixel]);
  canvasPixelColor = newColor;
  drawPixel(x, y, { hexColor : newColor } , true);
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

let isDraggingFlag = false;
let mouseDragX, mouseDragY;
function initFlagDrag(e) {
  isDraggingFlag = true;
  mouseDragX = e.clientX;
  mouseDragY = e.clientY;
}
function dragFlag(e) {
  if (isDraggingFlag) {
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
function endFlagDrag() {
  isDraggingFlag = false;
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
import AppAlert from "~/components/organisms/AppAlert";
import AppDoneIcon from "~/components/atoms/icons/AppDoneIcon";
import AppHelpIcon from "../components/atoms/icons/AppHelpIcon";
import AppButton from "../components/atoms/AppButton";
import AppPlaceIcon from "../components/atoms/icons/AppPlaceIcon";

export default {
  name: "edit",
  components: {
    AppPlaceIcon,
    AppButton,
    AppHelpIcon,
    AppDoneIcon,
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
        this.maxCooldownTime -
        (new Date() - new Date(this.lastSubmittedTime));
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
      if (this.isMounted && this.editedPixel) {
        changeColor(this.editedPixel.x, this.editedPixel.y, this.color);
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
      // console.log("REFRESH", ack);
      // console.log("Fetching the flag size");

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
              const localIndex = indexInFlagToLocalIndexMap[modifiedPixel.indexInFlag];
              if (localIndex == null) {
                flagPixels.push(modifiedPixel);
                indexInFlagToLocalIndexMap[modifiedPixel.indexInFlag] = flagPixels.length - 1;
              } else {
                flagPixels[localIndex] = modifiedPixel;
              }
            }

            const hasChanged = initializeFlagResolution();

            for (const modifiedPixel of modifiedPixels) {
              const localIndex = indexInFlagToLocalIndexMap[modifiedPixel.indexInFlag];
              const { x, y } = getCoordinateFromFlagIndex(localIndex);
              if (!flagPixelMap[x]) {
                flagPixelMap[x] = [];
                console.warn(`There was no row on x=${x}`);
              }
              flagPixelMap[x][y] = modifiedPixel;
              if (!hasChanged) {
                drawPixel(x, y, modifiedPixel);
              }
            }

            lastUpdate = new Date();
            this.setNeighboursInfo();

            if (hasChanged) {
              drawFlag(flagPixelMap);
            }
          }
        })
        // .catch((err) => console.log(err));
    },
    async FetchMap() {
      // console.log("Fetching the whole map");
      return await fetch(`${process.env.apiUrl}/flag`, {
        method: "GET",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log("DEBUG - New map array : ", data);

          data = data.filter(p => !!p)
            .sort((a, b) => (a.indexInflag - b.indexInFlag));

          flagPixels = data;
          initializeFlagResolution();

          const NEW_MAP = new Array(flagWidth);
          for (let i = 0; i < NEW_MAP.length; i++) {
            NEW_MAP[i] = new Array(flagHeight);
          }

          for (let i = 0; i < data.length; i++) {
            indexInFlagToLocalIndexMap[data[i].indexInFlag] = i;
            const { x, y } = getCoordinateFromFlagIndex(i);
            if (!NEW_MAP[x]) {
              NEW_MAP[x] = [];
              console.warn(`no row for x=${x}`)
            }
            NEW_MAP[x][y] = data[i];
          }
          // console.log('new map');
          return NEW_MAP;
        })
        // .catch((error) => console.log(error));
    },
    async setNeighboursInfo() {
      this.topPixel = await this.getNeighbourPixelIfItExists(this.x, this.y - 1 );
      this.leftPixel = await this.getNeighbourPixelIfItExists(this.x - 1, this.y);
      this.rightPixel = await this.getNeighbourPixelIfItExists(this.x + 1, this.y);
      this.bottomPixel = await this.getNeighbourPixelIfItExists(this.x, this.y + 1 );
      // console.log(this.leftPixel);
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
    async sendPixel() {
      if (this.requesting) return;
      if (!this.editedPixel) return;
      //Sending the user pixel with coords, color, timestamp?, userID?
      this.requesting = true;
      // console.log("Sending: ", UserPixel);
      const response = await fetch(`${process.env.apiUrl}/pixel`, {
        method: "PUT",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
        body: JSON.stringify({
          hexColor: canvasPixelColor,
          pixelId: this.editedPixel.entityId
        }),
      });
      const data = await response.json();
      if (data.retryAfter) {
        this.openFailedEditModal = true;
        this.errorMessage = 'CooldownNotEndedYet';
        this.lastSubmittedTime = new Date();
        this.maxCooldownTime = data.retryAfter;
      } else {
        this.openSuccessEditModal = true;
        this.FetchUserPixelAndMap();
      }
      this.requesting = false;
    },
    async FetchUserPixelAndMap() {
      // console.log("Fetching user pixel");
      await fetch(`${process.env.apiUrl}/pixel`, {
        method: "GET",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
      })
        .then((response) => response.json())
        .then(async (data) => {
          console.debug("User pixel : ", data);
          flagPixelMap = await this.FetchMap();
          const userPixelCoordinates = getCoordinateFromFlagIndex(indexInFlagToLocalIndexMap[data.indexInFlag]);
          this.x = userPixelCoordinates.x;
          this.y = userPixelCoordinates.y;
          this.color = data.hexColor;
          this.lastSubmittedTime = data.lastUpdate;
          console.debug("time last updated ", this.lastSubmittedTime);
          setUserPixel(this.x, this.y);
          changeColor(this.x, this.y, this.color);
          this.setPixelToEdit(null, { ...userPixelCoordinates, ...data });
          // console.log('here');
        })
        // .catch((error) => console.log(error));
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
    updateHoveredPixel(e) {
      let drawWidth = canvas.width / flagWidth;
      let drawHeight = canvas.height / flagHeight;

      this.hoveredPixelPosition = {
        x: Math.floor((cameraPositionX + e.offsetX / cameraZoom) / drawWidth),
        y: Math.floor((cameraPositionY + e.offsetY / cameraZoom) / drawHeight),
      };

      this.hoveredPixel = flagPixelMap[this.hoveredPixelPosition.x]?.[this.hoveredPixelPosition.y] || null;
    },
    setPixelToEditFromCoordinates() {
      const x = Number(this.modifiedPixelX) - 1;
      const y = Number(this.modifiedPixelY) - 1;
      const pixel = flagPixelMap[x]?.[y];
      this.setPixelToEdit(undefined, pixel ? { ...pixel, x, y } : null);
    },
    setPixelToEditFromHover() {
      this.setPixelToEdit(undefined,  this.hoveredPixel ? {
        ...this.hoveredPixelPosition,
        ...this.hoveredPixel,
      } : null);
    },
    setPixelToEdit(_, pixel) {
      if (this.editedPixel) {
        changeColor(this.editedPixel.x, this.editedPixel.y, this.editedPixel.hexColor);
      }

      if (pixel) {
        this.editedPixel = { ...pixel };
        this.color = this.editedPixel.hexColor;
        this.modifiedPixelX = this.editedPixel.x + 1;
        this.modifiedPixelY = this.editedPixel.y + 1;
      } else {
        this.editedPixel = null;
      }
    },
  },
  async mounted() {
    this.showHelp = localStorage.getItem('showHelp') !== 'false';
    this.fouloscopieSdk = await fouloscopie();
    this.token = this.fouloscopieSdk.userInfo.token;
    this.maxCooldownTime = await this.FetchCooldown();
    await this.FetchUserPixelAndMap();
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
    // // console.log("DEBUG - userToken : ", token);
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

.vc-chrome {
  box-shadow: none !important;
  border-radius: 0.25rem !important;
  overflow: hidden;
}

.vc-chrome-body {
  border: 1px solid rgb(220, 222, 228);
  border-top: 0;
  border-radius: 0 0 0.25rem 0.25rem;
}
.vc-input__label, .vc-input__input {
  color: #000 !important;
}

.pixelButton span {
  text-overflow: ellipsis;
  overflow: hidden;
}

.loader {
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 25px;
  height: 25px;
  animation: spin 2s linear infinite;
}


.big-loader {
  border: 13px solid #f3f3f3; /* Light grey */
  border-top: 13px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

#flagCanva {
  touch-action: none;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;

  background: #000000cc;
  color: #fff;
  border-radius: 0 0 0.25em 0;

  pointer-events: none;
}

#sidePanel {
  max-width: 100%;
}
@screen md {
  #sidePanel {
    width: 350px;
  }
}

.property-list > div {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.property-name {
  color: gray;
}

.number-input {
  border: 1px solid gray;
  width: 100%;
}
</style>
