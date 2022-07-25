import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    GridHelper,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    BoxGeometry,
    Color,
    MeshNormalMaterial,
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    Clock,  
    PCFSoftShadowMap,
} from "three";
  
const subsetOfTHREE = {
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils: {
        DEG2RAD: MathUtils.DEG2RAD,
        clamp: MathUtils.clamp
        }
};

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CameraControls from 'camera-controls';
import Stats from 'three/examples/jsm/libs/stats.module'
import { index } from 'hold-event/dist/hold-event.min.js'

//Import Dat.GUI Panel to be able to manipulate a 3D object directly in the page
import { GUI } from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
    CSS2DRenderer,
    CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer'

import { IFCLoader } from "web-ifc-three/IFCLoader";

// 0 The Canvas
  
  const canvas = document.getElementById("three-canvas");
  const labelCanvas = document.getElementById("canvas-label");
  
// 1 The scene

    // 1.0 Create a Scene
    const scene = new Scene();
    // 1.1 Give a color to the scene
    scene.background = new Color(0xdedeee)

    // 1.2 Load Axes for the scene
    const axes = new AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    scene.add(axes);
    

    // 1.3 Grid
    const grid = new GridHelper(50, 30);
    // grid.material.depthTest = false;
    // grid.renderOrder = 1;
    scene.add(grid);
  
// 2 The Object

    const boxGeometry = new BoxGeometry();
    const material = new MeshNormalMaterial({transparent: true});

// 3 The Camera

    // 3.1 Create the camera
    const camera = new PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight
    );
    camera.position.z = 15;
    camera.position.y = 13;
    camera.position.x = 8;

    // 3.2 Camera Controls
    CameraControls.install( { THREE: subsetOfTHREE } ); 
    const clock = new Clock();
    const cameraControls = new CameraControls(camera, canvas);

        // Min and Max DOLLY ("Zoom")
        cameraControls.minDistance = 3;
        cameraControls.maxDistance = 50;
        // Mouse controls
        cameraControls.mouseButtons.middle = CameraControls.ACTION.TRUCK;
        cameraControls.mouseButtons.right = CameraControls.ACTION.DOLLY;
        cameraControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
        // Polar Angle
        cameraControls.minPolarAngle = Math.PI / 4;
        cameraControls.maxPolarAngle = 0.55 * Math.PI;

        // Keyboards keys to navigate
        const KEYCODE = {
            W: 87,
            A: 65,
            S: 83,
            D: 68,
            ARROW_LEFT : 37,
            ARROW_UP   : 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN : 40,
        };

        const wKey = new holdEvent.KeyboardKeyHold( KEYCODE.W, 16.666 );
        const aKey = new holdEvent.KeyboardKeyHold( KEYCODE.A, 16.666 );
        const sKey = new holdEvent.KeyboardKeyHold( KEYCODE.S, 16.666 );
        const dKey = new holdEvent.KeyboardKeyHold( KEYCODE.D, 16.666 );
        aKey.addEventListener( 'holding', function( event ) { cameraControls.truck( - 0.01 * event.deltaTime, 0, false ) } );
        dKey.addEventListener( 'holding', function( event ) { cameraControls.truck(   0.01 * event.deltaTime, 0, false ) } );
        wKey.addEventListener( 'holding', function( event ) { cameraControls.forward(   0.01 * event.deltaTime, false ) } );
        sKey.addEventListener( 'holding', function( event ) { cameraControls.forward( - 0.01 * event.deltaTime, false ) } );
        
        const leftKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_LEFT,  100 );
        const rightKey = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_RIGHT, 100 );
        const upKey    = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_UP,    100 );
        const downKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_DOWN,  100 );
        leftKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( - 0.1 * MathUtils.DEG2RAD * event.deltaTime, 0, true ) } );
        rightKey.addEventListener( 'holding', function( event ) { cameraControls.rotate(   0.1 * MathUtils.DEG2RAD * event.deltaTime, 0, true ) } );
        upKey.addEventListener   ( 'holding', function( event ) { cameraControls.rotate( 0, - 0.05 * MathUtils.DEG2RAD * event.deltaTime, true ) } );
        downKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( 0,   0.05 * MathUtils.DEG2RAD * event.deltaTime, true ) } );

    // // 3.3 Set camera position (x, y , z) + camera target (x, y, z)
    // cameraControls.setLookAt(-2, 2, 8, 0, 1, 0)
    // // 3.4 Set the camera distance
    // cameraControls.distance = 12;

    // 3.5 Add the camera to the scene
    scene.add(camera);

// 4 The Renderer
    // WebGL Renderer
    const renderer = new WebGLRenderer({
        canvas: canvas,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    // Label Renderer
    const labelRenderer = new CSS2DRenderer({
        canvas: canvas,
    });
    labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight)
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.pointerEvents = 'none'
    labelCanvas.appendChild(labelRenderer.domElement)
  
// 5 Lights
  
    // Create an AmbientLight
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Create a SpotLight
    const light1 = new DirectionalLight(0xffffff, 2);
    light1.position.set( 0, 10, 0 );

    // Activate Shadows for the light
    light1.castShadow = true;
    light1.shadow.mapSize.width = 512;
    light1.shadow.mapSize.height = 512;
    light1.shadow.camera.near = 0.5;
    light1.shadow.camera.far = 200;
    // light1.shadow.bias = 0.02;

    const data = {
        color: light1.color.getHex(0x000000),
        mapsEnabled: true,
        shadowMapSizeWidth: 512,
        shadowMapSizeHeight: 512,
    }

    function updateShadowMapSize() {
    light1.shadow.mapSize.width = data.shadowMapSizeWidth;
    light1.shadow.mapSize.height = data.shadowMapSizeHeight;
    light1.shadow.map = null;
    }

    // Add the light & the target to the scene
    scene.add(light1);

// 6 Responsivity

    window.addEventListener("resize", () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight)
    });

// 7 Stats 
    const stats0 = Stats(0)
    const stats1 = Stats(1)
    const stats2 = Stats(2)

    const statsBar0 = stats0.dom;
    const statsBar1 = stats1.dom;
    const statsBar2 = stats2.dom;
    statsBar0.children.item(0).style.display = "flex";
    statsBar1.children.item(1).style.display = "flex";
    statsBar2.children.item(2).style.display = "flex";

    const statsContainer= document.querySelector('.stats-container');
    const firstStatBar = statsBar0.children.item(0);
    const secondStatBar = statsBar1.children.item(1);
    const ThirdStatBar = statsBar2.children.item(2);
    statsContainer.append(firstStatBar, secondStatBar, ThirdStatBar);

// 8 Animate
  
function animate() {
    // update the time for camera-controls
    const delta = clock.getDelta();
    // update camera-controls
    cameraControls.update( delta );
    
    requestAnimationFrame(animate);
    //render Scene and camera
    renderer.render( scene, camera );
    //render label renderer
    labelRenderer.render(scene, camera);
    
    // update shadow Size
    updateShadowMapSize()

    //reload stats panels
    stats0.update()
    stats1.update()
    stats2.update()
}
animate();

// Load an IFC Model
const input = document.getElementById("file-input");
const ifcLoader = new IFCLoader();

input.addEventListener(
    "change",
    async (changed) => {
        const ifcURL = URL.createObjectURL(changed.target.files[0]);
        const model = await ifcLoader.loadAsync(ifcURL);
        scene.add(model);
    },
    false
);