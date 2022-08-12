import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import CameraControls from 'camera-controls';
import { index } from 'hold-event/dist/hold-event.min.js'
import {
    Scene,
    WebGLRenderer,
    PCFSoftShadowMap,
    Clock,
    AxesHelper,
} from "three";

const container = document.getElementById('three-canvas');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
viewer.grid.setGrid();
viewer.axes.setAxes();

// 1.0 Get the Scene
const scene = viewer.context.getScene()

//Load IFC Model with IFC-THREE-VIEWER
async function loadIfc(url) {
    await viewer.IFC.setWasmPath("./");
    const model = await viewer.IFC.loadIfcUrl(url);
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;
    removeDispositionStyles(1)
    removeDispositionStyles(2)

    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
    createTreeMenu(ifcProject);
}

function removeDispositionStyles(index) {
    container.childNodes[index].style.top = null;
    container.childNodes[index].style.left = null;
    container.childNodes[index].style.height = null;
}

loadIfc('./models/Duplex_A.ifc');

// Highlighting and Getting Properties

window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();
window.ondblclick = async () => {
    const result = await viewer.IFC.selector.highlightIfcItem(true, true);
    if (!result) return;
    const { 
        modelID, 
        id 
    } = result;
    const props = await viewer.IFC.getProperties(modelID, id, true, false)
    createPropertiesMenu(props);
}

const propsGUI = document.getElementById("ifc-property-menu-root");

function createPropertiesMenu(properties) {
    console.log(properties);

    removeAllChildren(propsGUI);

    const psets = properties.psets;
    const mats = properties.mats;
    const type = properties.type;

    delete properties.psets;
    delete properties.mats;
    delete properties.type;

    for (let key in properties) {
        createPropertyEntry(key, properties[key]);
    }

}

function createPropertyEntry(key, value) {
    const propContainer = document.createElement("div");
    propContainer.classList.add("ifc-property-item");

    if(value === null || value === undefined) value = "undefined";
    else if(value.value) value = value.value;

    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    propContainer.appendChild(keyElement);

    const valueElement = document.createElement("div");
    valueElement.classList.add("ifc-property-value");
    valueElement.textContent = value;
    propContainer.appendChild(valueElement);

    propsGUI.appendChild(propContainer);
}

// Tree view

const toggler = document.getElementsByClassName("tree-caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].onclick = () => {
        toggler[i].parentElement.querySelector(".nested").classList.toggle("active");
        toggler[i].classList.toggle("caret-down");
    }
}

// Spatial tree menu

function createTreeMenu(ifcProject) {
    const root = document.getElementById("tree-root");
    removeAllChildren(root);
    const ifcProjectNode = createNestedChild(root, ifcProject);
    ifcProject.children.forEach(child => {
        constructTreeMenuNode(ifcProjectNode, child);
    })
}

function nodeToString(node) {
    return `${node.type} - ${node.expressID}`
}

function constructTreeMenuNode(parent, node) {
    const children = node.children;
    if (children.length === 0) {
        createSimpleChild(parent, node);
        return;
    }
    const nodeElement = createNestedChild(parent, node);
    children.forEach(child => {
        constructTreeMenuNode(nodeElement, child);
    })
}

function createNestedChild(parent, node) {
    const content = nodeToString(node);
    const root = document.createElement('li');
    createTitle(root, content);
    const childrenContainer = document.createElement('ul');
    childrenContainer.classList.add("nested");
    root.appendChild(childrenContainer);
    parent.appendChild(root);
    return childrenContainer;
}

function createTitle(parent, content) {
    const title = document.createElement("span");
    title.classList.add("tree-caret");
    title.onclick = () => {
        title.parentElement.querySelector(".nested").classList.toggle("active");
        title.classList.toggle("caret-down");
    }
    title.textContent = content;
    parent.appendChild(title);
}

function createSimpleChild(parent, node) {
    const content = nodeToString(node);
    const childNode = document.createElement('li');
    childNode.classList.add('leaf-node');
    childNode.textContent = content;
    parent.appendChild(childNode);

    childNode.onmouseenter = () => {
        viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
    }

    childNode.onclick = async () => {
        viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
    }
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


// 3 The Camera

    // 3.1 Get the camera
    const camera = viewer.context.getIfcCamera()

    // 3.2 Get Camera Controls
    const cameraControls = viewer.context.ifcCamera.cameraControls;
    const clock = new Clock();

        // Min and Max DOLLY ("Zoom")
        cameraControls.minDistance = 10;
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
        leftKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( - 0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true ) } );
        rightKey.addEventListener( 'holding', function( event ) { cameraControls.rotate(   0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true ) } );
        upKey.addEventListener   ( 'holding', function( event ) { cameraControls.rotate( 0, - 0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime, true ) } );
        downKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( 0,   0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime, true ) } );

    // 3.3 Set camera position (x, y , z) + camera target (x, y, z)
    cameraControls.setLookAt(-2, 2, 8, 0, 1, 0)
    // 3.4 Set the camera distance
    cameraControls.distance = 15;

// Fit Camera to the model bounding Box
    const fitViewButton = document.getElementById("fit-view");
    fitViewButton.onclick = () => {
        viewer.context.renderer.postProduction.active = false;
        // viewer.context.ifcCamera.cameraControls.fitToBox(scene.children[0], true);
        fitView()
        viewer.context.renderer.postProduction.active = true;

    }

    function fitView() {
        let cameraPositionX = cameraControls.getPosition().x;
        let cameraPositionY = cameraControls.getPosition().y;
        let cameraPositionZ = cameraControls.getPosition().z;
        let cameraTargetX = cameraControls.getTarget().x;
        let cameraTargetY = cameraControls.getTarget().y;
        let cameraTargetZ = cameraControls.getTarget().z;
        cameraControls.fitToBox(scene.children[0], false, {paddingTop:0, paddingLeft: 0, paddingBottom:0, paddingRight:0})
        let newCameraPositionX = cameraControls.getPosition().x;
        let newCameraPositionY = cameraControls.getPosition().y;
        let newCameraPositionZ = cameraControls.getPosition().z;
        let difPositionX = Math.abs(newCameraPositionX / cameraPositionX);
        let difPositionY = Math.abs(newCameraPositionY / cameraPositionY);
        let difPositionZ = Math.abs(newCameraPositionZ / cameraPositionZ);
        let distanceCoefficient = Math.max(difPositionX, difPositionY, difPositionZ)
        cameraControls.setPosition(cameraPositionX * distanceCoefficient, cameraPositionY * distanceCoefficient, cameraPositionZ * distanceCoefficient)
        cameraControls.setTarget(cameraTargetX, cameraTargetY, cameraTargetZ);
    }

// Left View
const leftViewButton = document.getElementById("left-view");
leftViewButton.onclick = () => {
    viewer.context.renderer.postProduction.active = false;
    cameraControls.setLookAt(-50, 2.7, 0, 0, 2.7, 0);
    cameraControls.fitToBox(scene.children[0], true, {paddingTop:0, paddingLeft: 0, paddingBottom:0, paddingRight:0});
    viewer.context.renderer.postProduction.active = true;
}

// Front View
const frontViewButton = document.getElementById("front-view");
frontViewButton.onclick = () => {
    viewer.context.renderer.postProduction.active = false;
    cameraControls.setLookAt(0, 2.7, 50, 0, 2.7, 0);
    cameraControls.fitToBox(scene.children[0], true, {paddingTop:0, paddingLeft: 0, paddingBottom:0, paddingRight:0});
    viewer.context.renderer.postProduction.active = true;
}

// Right View
const rightViewButton = document.getElementById("right-view");
rightViewButton.onclick = () => {
    viewer.context.renderer.postProduction.active = false;
    cameraControls.setLookAt(50, 2.7, 0, 0, 2.7, 0);
    cameraControls.fitToBox(scene.children[0], true, {paddingTop:0, paddingLeft: 0, paddingBottom:0, paddingRight:0});
    viewer.context.renderer.postProduction.active = true;
}

// Back View
const backViewButton = document.getElementById("back-view");
backViewButton.onclick = () => {
    viewer.context.renderer.postProduction.active = false;
    cameraControls.setLookAt(0, 2.7, -50, 0, 2.7, 0);
    cameraControls.fitToBox(scene.children[0], true, {paddingTop:0, paddingLeft: 0, paddingBottom:0, paddingRight:0});
    viewer.context.renderer.postProduction.active = true;
}

function animate() {
    // update the time for camera-controls
    const delta = clock.getDelta();
    // update camera-controls
    cameraControls.update( delta );
    
    requestAnimationFrame(animate); 
    //render Scene and camera
    // renderer.render( scene, camera );
    // //render label renderer
    // labelRenderer.render(scene, camera);
    
    // update shadow Size
    // updateShadowMapSize()
}
animate();