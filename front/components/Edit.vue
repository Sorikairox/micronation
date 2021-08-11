<template>
    <div class="flex flex-row justify-between">
        <div id="PixelChoice" class="w-4/6 mx-4 my-32 border-2 border-blue-400">
        <canvas id="flagCanva" class="border-2 border-blue-400"/>
        </div>
        <div class="flex flex-col items-center justify-between w-2/6 p-8 mx-4 my-32 border-2 border-blue-400">
            <div class="flex flex-row justify-between w-full border-2 border-red-400 h-1/2 mb-9">
                <color-panel v-model="color" @change="change"/>
                <div class="flex flex-col items-center justify-around w-1/2 border-2">
                <p>Votre pixel {{x}}:{{y}}</p>
                <button v-on:click="Finish()" class="px-4 py-2 text-gray-100 bg-blue-600 rounded-lg">
                    Editer le drapeau
                </button>
                <button v-on:click="Overlay()" class="px-4 py-2 text-gray-100 bg-blue-600 rounded-lg">
                    Voir mon pixel
                </button>
                </div>
            </div>
            <div class="w-full h-full border-2 border-red-400">
                <canvas id="zoomCanva" class="w-full h-full border-2 border-blue-400"/>
            </div>
        </div>
    </div>
</template>

<script>
import {ColorPicker, ColorPanel} from 'one-colorpicker'
import * as THREE from 'three';

//Initialising all the var
const ratio = 2/1
const xPixel = 200
const yPixel = ~~(xPixel/ratio)
const mouse = new THREE.Vector2();

//The initial map
const MAP_BASE = new Array(xPixel);

//element var
let container, WIDTH, HEIGHT
let BoundingBox

//Canvas var
let canvas, context
let zoomCanvas, zoomContext

//Color from the colorPicker
let color = '#ff0000'

//the coords of the user's pixel
let userXPixel = 0
let userYPixel = 0

//offset for centering the zoomCanva
let Xoffset, Yoffset, zoom = 2

//Initalising the MAP
for (let i = 0; i < MAP_BASE.length; i++) {
  MAP_BASE[i] = new Array(yPixel);
}

//Seting the color (here is a french flag)
for (let i = 0; i<MAP_BASE.length; i++) {
    for (let j = 0; j<MAP_BASE[0].length; j++) {
        if(i < MAP_BASE.length/3) {
            MAP_BASE[i][j] = '#0000ff'
        }
        else if (i < MAP_BASE.length/1.5) {
            MAP_BASE[i][j] = '#00ff00'   
        }
        else {
            MAP_BASE[i][j] = '#ff0000'
        }
    }
}

//Draw EVERY PIXEL of the map given
function drawFlag(MAP) {
    for (let i = 0; i<MAP.length; i++) {
        for (let j = 0; j<MAP[0].length; j++) {
            drawPixel(i,j,MAP[i][j])
        }
    }
}

//Draw a grid, usefull for debuging but can bug
function drawGrid() {
    for (let i = 0; i<MAP_BASE.length; i++) {
        for (let j = 0; j<MAP_BASE[0].length; j++) {
            if(i % 8 == 0) {
                MAP_BASE[i][j] = '#ff00ff'
            }
            if (j % 8 == 0) {
                MAP_BASE[i][j] = '#ff00ff'   
            }
        }
    }
}

//Draw an overlay to find the user pixel on the whole flag
function drawOverlay() {
    for (let i = 0; i<MAP_BASE.length; i++) {
        for (let j = 0; j<MAP_BASE[0].length; j++) {
            if(!(i==userXPixel && j== userYPixel)){
                drawPixel(i,j,"#0a0a0a")
            }
        }
    }    
}

//Draw a pixel on a coord given (x,y,clr), if changetexture is set to true, change the value on the map
//You can change the size and the context to draw, default is flag's context
function drawPixel(x,y,clr, changeTexture = false, size=1, ctx = context) {
    let drawSize = (WIDTH/xPixel)*size
    ctx.fillStyle = clr;
    ctx.fillRect(x*drawSize,y*drawSize,drawSize,drawSize) 
    if (changeTexture) {
        MAP_BASE[x][y] = clr
    }
}

//Initalising the zoom canvas
function initZoom() {
    zoomCanvas = document.getElementById('zoomCanva'),
    zoomContext = zoomCanvas.getContext('2d');
    Xoffset = zoomCanvas.width/(2*zoom)
    Yoffset = zoomCanvas.height/(2*zoom)

    drawZoom()
}

//Draw the zoom canvas (use the flag canvas and zoom it)
function drawZoom(x = userXPixel*WIDTH/xPixel, y = userYPixel*HEIGHT/yPixel) {
    x-Xoffset < 0 ? x=0 : x+Xoffset > WIDTH ? x=WIDTH-2*Xoffset : x-=Xoffset;
    y-Yoffset < 0 ? y=0 : y+Yoffset > HEIGHT ? y=HEIGHT-2*Yoffset : y-=Yoffset;
    zoomContext.drawImage(canvas, x, y, zoomCanvas.width/zoom, zoomCanvas.height/zoom, 0, 0, zoomCanvas.width, zoomCanvas.height);
}

//Initalising the variables to their value
function init() {
    container = document.getElementById("PixelChoice")
    WIDTH = 1200
    HEIGHT = 600
    canvas = document.getElementById('flagCanva'),
    BoundingBox = canvas.getBoundingClientRect();
    canvas.height = HEIGHT
    canvas.width = WIDTH
    context = canvas.getContext('2d');

    // drawGrid()
    drawFlag(MAP_BASE)
    initZoom()

    window.addEventListener( 'resize', onWindowResize );
    canvas.addEventListener( 'pointermove', onPointerMove, false );
    canvas.addEventListener( 'pointerdown', onPointerDown, false );
}

//Change the color value and draw it to the user pixel
function changeColor(newColor) {
    drawPixel(userXPixel,userYPixel, newColor, true)
    color = newColor
    drawZoom()
}

function getCanvas() {
    return(canvas)
}

function setUserPixel(x,y) {
    userXPixel = x
    userYPixel = y
}

function onWindowResize() {
  WIDTH = container.clientWidth
  HEIGHT = container.clientHeight
  BoundingBox = container.getBoundingClientRect();
}

//Draw a pixel on the pointer's coords
function onPointerDown( event ) {
    drawPixel(~~((mouse.x+1)*xPixel/2),~~((-mouse.y+1)*yPixel/2), color, true)
}

function onPointerMove(e) {
	mouse.y = -( (e.clientY - BoundingBox.top) / HEIGHT ) * 2 + 1;
    mouse.x = ( (e.clientX - BoundingBox.left) / WIDTH ) * 2 - 1;
    drawZoom(~~((mouse.x+1)*WIDTH/2),~~((-mouse.y+1)*HEIGHT/2))
}

export default {
    name: 'edit',
    components: {ColorPicker, ColorPanel},
    data() {
        return {
            color: 'ffffff',
            x: ~~(Math.random()*200),
            y: ~~(Math.random()*100)
        }
    },
    methods: {
        change() {
            changeColor(this.color)
        },
        Finish() {
            $nuxt.$emit('newTexture', getCanvas())
        },
        Overlay() {
            drawOverlay()
            setTimeout(() => {
                drawFlag(MAP_BASE)
            }, 3000);
        }
    },
    mounted() {
        setUserPixel(this.x,this.y)

        init()
    }
}
</script>

<style>
#flagCanva {
    width: 1200px;
    height: 600px
}
#zoomCanva {
    width: 600px;
    height: 300px
}
</style>