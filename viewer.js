import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { projectsCards } from "./projects.js";

// Get the current URL
const currentURL = window.location.href;
// Create a new URL Parameter to get information from it
const url = new URL (currentURL);
// Get the id variable from the URL
const projectID = url.searchParams.get("id");
// Get the project link variable from the URL
const projectLink = url.searchParams.get("projectURL");

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xe1e1f0) });
viewer.grid.setGrid();
viewer.axes.setAxes();

async function loadIfc(url) {
    await viewer.IFC.setWasmPath("./node_modules/web-ifc/");
    const model = await viewer.IFC.loadIfcUrl(url);
    viewer.shadowDropper.renderShadow(model.modelID);
}

loadIfc(projectLink);

function ProjectShortcut(id)
{
    if (id == 'ps1'){
        projectLink = './IFC/01.ifc';
        loadIfc(projectLink);
    }
    else if (id == 'ps2'){
        projectLink = './IFC/02.ifc/';
        loadIfc(projectLink);
    }
    else if (id == 'ps3'){
        projectLink = './IFC/03.ifc/';
        loadIfc(projectLink);
    }
    else if (id == 'ps4'){
        projectLink = './IFC/04.ifc/';
        loadIfc(projectLink);
    }
    else if (id == 'ps5'){
        projectLink = './IFC/05.ifc/';
        loadIfc(projectLink);
    }
    else {
        alert('\nThere is no model for this project yet.\nPlease make a selection between Project nº1 and Project nº5.');
        window.open('./viewer.html', '_self');
    }
}