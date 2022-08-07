import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import {
    Scene,
    WebGLRenderer,
    PCFSoftShadowMap,
} from "three";
// import Stats from 'three/examples/jsm/libs/stats.module'
// import { IdAttrName } from 'web-ifc-three/IFC/BaseDefinitions';

const container = document.getElementById('three-canvas');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
viewer.grid.setGrid();
viewer.axes.setAxes();

// // 7 Stats 
// const stats0 = Stats(0)
// const stats1 = Stats(1)
// const stats2 = Stats(2)

// const statsBar0 = stats0.dom;
// const statsBar1 = stats1.dom;
// const statsBar2 = stats2.dom;
// statsBar0.children.item(0).style.display = "flex";
// statsBar1.children.item(1).style.display = "flex";
// statsBar2.children.item(2).style.display = "flex";

// const statsContainer= document.querySelector('.stats-container');
// const firstStatBar = statsBar0.children.item(0);
// const secondStatBar = statsBar1.children.item(1);
// const ThirdStatBar = statsBar2.children.item(2);
// statsContainer.append(firstStatBar, secondStatBar, ThirdStatBar);

function animate() {
    // // update the time for camera-controls
    // const delta = clock.getDelta();
    // update camera-controls
    // cameraControls.update( delta );
    
    requestAnimationFrame(animate); 
    //render Scene and camera
    // renderer.render( scene, camera );
    // //render label renderer
    // labelRenderer.render(scene, camera);
    
    // update shadow Size
    // updateShadowMapSize()

    // //reload stats panels
    // stats0.update()
    // stats1.update()
    // stats2.update()
}
animate();

//IFC.JS
async function loadIfc(url) {
    await viewer.IFC.setWasmPath("./");
    const model = await viewer.IFC.loadIfcUrl(url);
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;
    removeDispositionStyles(1)
    removeDispositionStyles(2)
}

function removeDispositionStyles(index) {
    container.childNodes[index].style.top = null;
    container.childNodes[index].style.left = null;
    container.childNodes[index].style.height = null;
}

loadIfc('./models/Duplex_A.ifc');

window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();
window.ondblclick = async () => {
    const result = await viewer.IFC.selector.highlightIfcItem(true);
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

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}