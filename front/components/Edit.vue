<template>
    <div class="flex flex-row justify-between">
        <div id="PixelChoice" class="w-4/6 mx-4 border-2 border-blue-400 my-32">
        <canvas id="viewport" class="w-full h-full">
        </canvas>
        </div>
        <div class="flex flex-col items-center justify-between p-8 w-2/6 mx-4 border-2 border-blue-400 my-32">
            <div class="flex flex-row justify-between border-2 border-red-400 w-full h-1/2">
                <p>Choix du pixel</p>
                <color-panel v-model="color" @change="change"/>
            </div>
            <div>
                <button v-on:click="Finish()" class="rounded-lg bg-blue-600 text-gray-100 px-4 py-2">
                    Editer le drapeau
                </button>
                Apercu drapeau / Zoom
            </div>
        </div>
    </div>
</template>

<script>
import {ColorPicker, ColorPanel} from 'one-colorpicker'
import * as THREE from 'three';
import * as url from '../assets/flagFR.png';
import { saveAs } from 'file-saver';



let container, WIDTH, HEIGHT
const mouse = new THREE.Vector2();
let BoundingBox

let canvas, context, base_image, color

function make_base()
{
  base_image = new Image();
  base_image.src = url.default;
  base_image.onload = function(){
    context.drawImage(base_image, 0,0,1920,1080);
  }
}

function save() {
    var ret = canvas.toDataURL("image/png");
    // console.log(img+'save')
    // canvas.toBlob(function(blob) {
    //     ret = blob
    // })
    return(ret)
}

function init() {
    container = document.getElementById("PixelChoice")
    WIDTH = container.clientWidth
    HEIGHT = container.clientHeight
    BoundingBox = container.getBoundingClientRect();
    canvas = document.getElementById('viewport'),
    canvas.height = HEIGHT
    canvas.width = WIDTH
    context = canvas.getContext('2d');

    make_base();

    window.addEventListener( 'resize', onWindowResize );
    container.addEventListener( 'pointermove', onPointerMove, false );
    container.addEventListener( 'pointerdown', onPointerDown, false );
}

function onPointerDown( event ) {
    context.fillStyle = color;
    context.fillRect((mouse.x+1)*WIDTH/2,(-mouse.y+1)*HEIGHT/2,20,20)

}

function onPointerMove(e) {
	mouse.y = -( (e.clientY - BoundingBox.top) / HEIGHT ) * 2 + 1;
    mouse.x = ( (e.clientX - BoundingBox.left) / WIDTH ) * 2 - 1;

    // console.log(mouse.x, mouse.y)
}

function changeColor(newColor) {
    color = newColor
}

function onWindowResize() {
  WIDTH = container.clientWidth
  HEIGHT = container.clientHeight
  BoundingBox = container.getBoundingClientRect();
}

export default {
    name: 'edit',
    components: {ColorPicker, ColorPanel},
    data() {
        return {
            color: 'ffffff'
        }
    },
    methods: {
        change() {
            changeColor(this.color)
        },
        Finish() {
            $nuxt.$emit('NewImage')
        }
    },
    mounted() {
        init()
    }
}
</script>

<style>

</style>