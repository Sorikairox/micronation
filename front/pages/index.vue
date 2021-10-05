<template>
  <div class="w-screen h-screen min-w-full min-h-full">
    <div id="flag" class="absolute inset-0 z-10 w-full h-full" />
    <canvas
      id="textureCanva"
      class="hidden mx-auto border-2 rounded-md border-grey-dark"
    />
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "@/components/OrbitControl.js";

let desired_flag_width = 500;

async function getFlag() {
  const response = await fetch(`${process.env.apiUrl}/flag`, {
    method: "GET",
    crossDomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
}
function computeTextureWidthAndHeightFromFlag(flag) {
  let width;
  let height;
  if (flag.length < desired_flag_width) {
    height = 1;
    width = flag.length;
  } else {
    width = desired_flag_width;
    height = ~~(flag.length / desired_flag_width) + 1;
  }
  return { width, height }
}

function createTextureArray(width, height, flag_data) {
  const textureArray = new Uint8Array(4 * width * height);

  let i = 0;

  while (i < flag_data.length) {
    const color = new THREE.Color(flag_data[i].hexColor);
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    const stride = i * 4;

    textureArray[stride] = r;
    textureArray[stride + 1] = g;
    textureArray[stride + 2] = b;
    textureArray[stride + 3] = 255;
    i++;
  }
  i = i * 4;
  while (i < 4 * width * height) {
    textureArray[i++] = 0;
  }
  return textureArray;
}


export default {
  name: "index",
  data() {
    return {};
  },
  async mounted() {

    const flag_data = await getFlag();
    let { width, height } = computeTextureWidthAndHeightFromFlag(flag_data);

    let new_data = createTextureArray(width, height, flag_data);
    // used the buffer to create a DataTexture
    const flag_texture = new THREE.DataTexture(
      new_data,
      width,
      height,
      THREE.RGBAFormat
    );

    // Switch the y-axis, a THREEjs little joke
    flag_texture.wrapT = THREE.RepeatWrapping;
    flag_texture.repeat.y = -1;

    const params = {
      enableWind: true,
      showBall: false,
      togglePins: togglePins,
    };

    const DAMPING = 0.03;
    const DRAG = 1 - DAMPING;
    const MASS = 0.1;

    //changing ratio here
    const ratio = 1920 / 1080;
    const restDistance = 25;
    const xSegs = 10;
    const ySegs = 10;
    const clothFunction = plane(
      restDistance * xSegs * ratio,
      restDistance * ySegs
    );

    const GRAVITY = 981 * 1.4;
    const gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(MASS);

    const TIMESTEP = 18 / 1000;
    const TIMESTEP_SQ = TIMESTEP * TIMESTEP;

    const poleHeight = ySegs * restDistance * 2.5;

    let pins = [];

    const windForce = new THREE.Vector3(0, 0, 0);

    const tmpForce = new THREE.Vector3();
    const diff = new THREE.Vector3();

    class Particle {
      constructor(y, x, z, mass) {
        this.position = new THREE.Vector3();
        this.previous = new THREE.Vector3();
        this.original = new THREE.Vector3();
        this.a = new THREE.Vector3(0, 0, 0); // acceleration
        this.mass = mass;
        this.invMass = 1 / mass;
        this.tmp = new THREE.Vector3();
        this.tmp2 = new THREE.Vector3();

        // init

        clothFunction(x, y, this.position); // position
        clothFunction(x, y, this.previous); // previous
        clothFunction(x, y, this.original);
      }

      // Force -> Acceleration

      addForce(force) {
        this.a.add(this.tmp2.copy(force).multiplyScalar(this.invMass));
      }

      // Performs Verlet integration

      integrate(timesq) {
        const newPos = this.tmp.subVectors(this.position, this.previous);
        newPos.multiplyScalar(DRAG).add(this.position);
        newPos.add(this.a.multiplyScalar(timesq));

        this.tmp = this.previous;
        this.previous = this.position;
        this.position = newPos;

        this.a.set(0, 0, 0);
      }
    }

    class Cloth {
      constructor(w = 10, h = 10) {
        this.w = w;
        this.h = h;

        const particles = [];
        const constraints = [];

        // Create particles

        for (let v = 0; v <= h; v++) {
          for (let u = 0; u <= w; u++) {
            particles.push(new Particle(u / w, v / h, 0, MASS));
          }
        }

        // Structural

        for (let v = 0; v < h; v++) {
          for (let u = 0; u < w; u++) {
            constraints.push([
              particles[index(u, v)],
              particles[index(u, v + 1)],
              restDistance,
            ]);

            constraints.push([
              particles[index(u, v)],
              particles[index(u + 1, v)],
              restDistance,
            ]);
          }
        }

        for (let u = w, v = 0; v < h; v++) {
          constraints.push([
            particles[index(u, v)],
            particles[index(u, v + 1)],
            restDistance,
          ]);
        }

        for (let v = h, u = 0; u < w; u++) {
          constraints.push([
            particles[index(u, v)],
            particles[index(u + 1, v)],
            restDistance,
          ]);
        }

        // While many systems use shear and bend springs,
        // the relaxed constraints model seems to be just fine
        // using structural springs.
        // Shear
        // const diagonalDist = Math.sqrt(restDistance * restDistance * 2);

        // for (v=0;v<h;v++) {
        // 	for (u=0;u<w;u++) {

        // 		constraints.push([
        // 			particles[index(u, v)],
        // 			particles[index(u+1, v+1)],
        // 			diagonalDist
        // 		]);

        // 		constraints.push([
        // 			particles[index(u+1, v)],
        // 			particles[index(u, v+1)],
        // 			diagonalDist
        // 		]);

        // 	}
        // }

        this.particles = particles;
        this.constraints = constraints;

        function index(u, v) {
          return u + v * (w + 1);
        }

        this.index = index;
      }
    }

    let container;
    let camera, scene, renderer;
    let WIDTH, HEIGHT;

    let clothGeometry;
    let object;
    let pole;

    let hover = false,
      clicked = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const cloth = new Cloth(xSegs, ySegs);
    const pinsFormation = [];

    pins = [0, 11, 22, 33, 44, 55, 66, 77, 88, 99, 110]; //stable
    pinsFormation.push(pins);

    // pins = []; //Bye lel
    // pinsFormation.push( pins );

    pins = [0, cloth.h * 11]; //2 Pins, more classical ?
    pinsFormation.push(pins);

    pins = pinsFormation[0];

    function plane(width, height) {
      return function (u, v, target) {
        const x = (v - 0.5) * width;
        const y = (u + 0.5) * height;
        const z = 0;

        target.set(x, y, z);
      };
    }

    function satisfyConstraints(p1, p2, distance) {
      diff.subVectors(p2.position, p1.position);
      const currentDist = diff.length();
      if (currentDist === 0) return; // prevents division by 0
      const correction = diff.multiplyScalar(1 - distance / currentDist);
      const correctionHalf = correction.multiplyScalar(0.5);
      p1.position.add(correctionHalf);
      p2.position.sub(correctionHalf);
    }

    function simulate(now) {
      // const windStrength = Math.abs(Math.cos( now / 7000 ) * 20 + 100);
      const windStrength = Math.abs(Math.cos(now / 7000) * 250);
      // const windStrength = 250

      windForce.set(1, 0.1, 0.1);
      windForce.normalize();
      windForce.multiplyScalar(windStrength);

      // Aerodynamics forces

      const particles = cloth.particles;

      if (params.enableWind) {
        let indx;
        const normal = new THREE.Vector3();
        const indices = clothGeometry.index;
        const normals = clothGeometry.attributes.normal;

        for (let i = 0, il = indices.count; i < il; i += 3) {
          for (let j = 0; j < 3; j++) {
            indx = indices.getX(i + j);
            normal.fromBufferAttribute(normals, indx);
            tmpForce
              .copy(normal)
              .normalize()
              .multiplyScalar(normal.dot(windForce));
            particles[indx].addForce(tmpForce);
          }
        }
      }

      for (let i = 0, il = particles.length; i < il; i++) {
        const particle = particles[i];
        particle.addForce(gravity);

        particle.integrate(TIMESTEP_SQ);
      }

      // Start Constraints

      const constraints = cloth.constraints;
      const il = constraints.length;

      for (let i = 0; i < il; i++) {
        const constraint = constraints[i];
        satisfyConstraints(constraint[0], constraint[1], constraint[2]);
      }

      // Floor Constraints

      for (let i = 0, il = particles.length; i < il; i++) {
        const particle = particles[i];
        const pos = particle.position;
        if (pos.y < -250) {
          pos.y = -250;
        }
      }

      // Pin Constraints

      for (let i = 0, il = pins.length; i < il; i++) {
        const xy = pins[i];
        const p = particles[xy];
        p.position.copy(p.original);
        p.previous.copy(p.original);
      }
    }

    function togglePins() {
      pins = pinsFormation[~~(Math.random() * pinsFormation.length)];
    }

    function init() {
      container = document.getElementById("flag");
      WIDTH = container.clientWidth;
      HEIGHT = container.clientHeight;

      // scene

      scene = new THREE.Scene();
      // scene.background = new THREE.Color( 0xcce0ff );
      scene.background = new THREE.Color(0xcce0ff);

      scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

      // camera
      camera = new THREE.PerspectiveCamera(30, WIDTH / HEIGHT, 1, 10000);
      camera.position.set(
        (xSegs * ratio * restDistance) / 2,
        poleHeight / 2,
        2000
      );

      // lights

      scene.add(new THREE.AmbientLight(0x666666));

      const light = new THREE.DirectionalLight(0xdfebff, 1);
      light.position.set(0, 450, 500);
      light.position.multiplyScalar(1.3);
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;

      const d = 500;
      light.shadow.camera.left = -d;
      light.shadow.camera.right = d;
      light.shadow.camera.top = d;
      light.shadow.camera.bottom = -d;
      // light.shadow.camera.near = 0.5;

      light.shadow.camera.far = 2000;
      scene.add(light);

      const clothMaterial = new THREE.MeshLambertMaterial({
        map: flag_texture,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
      });

      // cloth geometry
      clothGeometry = new THREE.ParametricBufferGeometry(
        clothFunction,
        cloth.w,
        cloth.h
      );

      // cloth mesh
      object = new THREE.Mesh(clothGeometry, clothMaterial);
      object.position.set(
        (xSegs * ratio * restDistance) / 2,
        poleHeight - ySegs * restDistance * 1.5 - 5,
        0
      );
      object.castShadow = true;
      scene.add(object);

      object.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: flag_texture,
        alphaTest: 0.5,
      });

      // ground
      const ground = require("@/assets/grasslight-big5.jpg");
      const groundTexture = new THREE.TextureLoader().load(ground);
      groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
      groundTexture.repeat.set(150, 150);
      groundTexture.anisotropy = 16;
      groundTexture.encoding = THREE.sRGBEncoding;
      const groundMaterial = new THREE.MeshLambertMaterial({
        map: groundTexture,
      });
      let mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(20000, 20000),
        groundMaterial
      );
      mesh.position.y = -5;
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      scene.add(mesh);

      //poles
      const poleGeo = new THREE.BoxGeometry(5, poleHeight, 5);
      const poleMat = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0xafafff),
      });

      const footGeo = new THREE.BoxGeometry(10, 10, 10);
      const footMat = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0x000000),
      });

      const headGeo = new THREE.SphereGeometry(5, 20, 20);
      const headMat = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0x000000),
      });
      //Pole
      pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.x = 0;
      pole.position.y = poleHeight / 2;
      pole.receiveShadow = true;
      pole.castShadow = true;
      scene.add(pole);
      //Foot
      mesh = new THREE.Mesh(footGeo, footMat);
      mesh.position.x = 0;
      mesh.position.y = 0;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      scene.add(mesh);
      //head
      mesh = new THREE.Mesh(headGeo, headMat);
      mesh.position.x = 0;
      mesh.position.y = poleHeight - 3;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      scene.add(mesh);
      //Focus point
      const Focuspoint = new THREE.Mesh(
        headGeo,
        new THREE.MeshLambertMaterial({ color: new THREE.Color(0xff0000) })
      );
      Focuspoint.position.x = (xSegs * ratio * restDistance) / 3;
      Focuspoint.position.y = poleHeight - ySegs * restDistance;
      Focuspoint.receiveShadow = true;
      Focuspoint.castShadow = true;

      // renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(WIDTH, HEIGHT);
      container.appendChild(renderer.domElement);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;

      // controls
      const controls = new OrbitControls(camera, renderer.domElement);
      camera.lookAt(Focuspoint.position);
      controls.target = Focuspoint.position;
      controls.maxPolarAngle = Math.PI * 0.5;
      controls.minDistance = 1000;
      controls.maxDistance = 5000;

      window.addEventListener("resize", onWindowResize);
      container.addEventListener("pointermove", onPointerMove, false);
      container.addEventListener("pointerdown", onPointerDown, false);
      container.addEventListener("pointerup", onPointerUp, false);

      return animate(0);
    }

    function onWindowResize() {
      WIDTH = container.clientWidth;
      HEIGHT = container.clientHeight;

      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();

      renderer.setSize(WIDTH, HEIGHT);
    }

    function onPointerMove(event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components

      mouse.x = (event.clientX / WIDTH) * 2 - 1;
      mouse.y = -(event.clientY / HEIGHT) * 2 + 1;
    }

    function onPointerDown(event) {
      if (hover) {
        clicked = true;
      }
    }

    function onPointerUp(event) {
      if (clicked && hover) {
        $nuxt.$emit("FlagClick");
      }
      clicked = false;
    }

    function animate(now) {
       requestAnimationFrame(animate);
      simulate(now);
      render();
    }

    function windSimulation(p) {
      for (let i = 0, il = p.length; i < il; i++) {
        const v = p[i].position;
        clothGeometry.attributes.position.setXYZ(i, v.x, v.y, v.z);
      }
      clothGeometry.attributes.position.needsUpdate = true;
      clothGeometry.computeVertexNormals();
    }

    function render() {
      windSimulation(cloth.particles);

      raycaster.setFromCamera(mouse, camera);

      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects[0]?.object == object) {
        pole.material.color.set(0xff0000);
        hover = true;
      } else {
        pole.material.color.set(0xafafff);
        hover = false;
      }

      renderer.render(scene, camera);
    }

    init();
    this.$nuxt.$on("FlagClick", () => {
      this.$router.push({ name: "edit" });
    });
  },
};
</script>

<style scoped></style>
