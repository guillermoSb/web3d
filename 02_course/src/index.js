
import './style.css';

import * as THREE from 'three';
import * as dat from 'dat.gui';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();

// BEGIN GUI
const gui = new dat.GUI();
const world = {
    plane: {
        width: 400,
        height: 400,
        widthSegments: 50,
        heightSegments: 50,
    }
};

// END GUI

// BEGIN CAMERA
const fov = 75;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far)
camera.position.z = 50;
// END CAMERA


// BEGIN RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);
// END RENDERER
new OrbitControls(camera, renderer.domElement);


// BEGIN LIGHT
const light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(0, 1, 1);
scene.add(light)
const backLight = new THREE.DirectionalLight(0xFFFFFF, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);
// END LIGHT

// GEOMETRY
const planeGeometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments);
// GEOMETRY
// MATERIAL
const material = new THREE.MeshPhongMaterial({

    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true
});
// MATERIAL

// MESH
const mesh = new THREE.Mesh(planeGeometry, material);
scene.add(mesh);

// MESH

// GUI CONFIG
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)

// GUI CONFIG

function generatePlane() {
    mesh.geometry.dispose();
    const planeGeometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments);
    mesh.geometry = planeGeometry;
    const { array } = mesh.geometry.attributes.position;
    const randomValues = [];
    for (let index = 0; index < array.length; index++) {
        if (index % 3 === 0) {
            const x = array[index];
            const y = array[index + 1];
            const z = array[index + 2];
            array[index] = x + (Math.random() - 0.5) * 3;
            array[index + 1] = y + (Math.random() - 0.5) * 3;
            array[index + 2] = z + (Math.random() - 0.5) * 3;
        }

        randomValues.push(Math.random() + Math.PI * 2);
    }

    const colors = [];
    for (let index = 0; index < mesh.geometry.attributes.position.count; index++) {
        colors.push(0, .19, .4);
    }
    mesh.geometry.attributes.position.originalPosition = mesh.geometry.attributes.position.array;
    mesh.geometry.attributes.position.randomValues = randomValues;

    mesh.geometry.setAttribute('color',
        new THREE.BufferAttribute(new Float32Array(colors), 3)
    );
    console.log(mesh.geometry.attributes)

}

const mouse = {
    x: undefined,
    y: undefined
}

let frame = 0
function animate() {
    frame += 0.01;

    requestAnimationFrame(animate)
    raycaster.setFromCamera(mouse, camera);
    const { array, originalPosition, randomValues } = mesh.geometry.attributes.position;
    for (let i = 0; i < array.length; i += 3) {
        // x
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.0025;
        // y
        array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.0025;
    }
    mesh.geometry.attributes.position.needsUpdate = true;

    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
        const { color } = intersects[0].object.geometry.attributes;
        [1, 0.]
        // Vertice 1
        color.setX(intersects[0].face.a, 0.1);
        color.setY(intersects[0].face.a, 0.5);
        color.setZ(intersects[0].face.a, 1);
        // Vertice 2
        color.setX(intersects[0].face.b, 0.1);
        color.setY(intersects[0].face.b, 0.5);
        color.setZ(intersects[0].face.b, 1);
        // Vertice 3
        color.setX(intersects[0].face.c, 0.1);
        color.setY(intersects[0].face.c, 0.5);
        color.setZ(intersects[0].face.c, 1);
        color.needsUpdate = true;

        const initialColor = {
            r: 0,
            g: .19,
            b: .4
        };
        const hoverColor = {
            r: 0.1,
            g: 0.4,
            b: 1
        }
        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            onUpdate: () => {
                // Vertice 1
                color.setX(intersects[0].face.a, hoverColor.r);
                color.setY(intersects[0].face.a, hoverColor.g)
                color.setZ(intersects[0].face.a, hoverColor.b);
                // Vertice 2
                color.setX(intersects[0].face.b, hoverColor.r);
                color.setY(intersects[0].face.b, hoverColor.g)
                color.setZ(intersects[0].face.b, hoverColor.b);
                // Vertice 3
                color.setX(intersects[0].face.c, hoverColor.r);
                color.setY(intersects[0].face.c, hoverColor.g)
                color.setZ(intersects[0].face.c, hoverColor.b);
                color.needsUpdate = true;
            }
        });
    }
    renderer.render(scene, camera);
}



generatePlane();
requestAnimationFrame(animate);


addEventListener('mousemove', (event) => {
    mouse.x = ((event.clientX / innerWidth) * 2) - 1;
    mouse.y = ((event.clientY / innerHeight) * -2) + 1;

});

