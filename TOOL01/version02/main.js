// Constants and scene setup
const container = document.querySelector('#three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Cube state
const cubeState = {
    rotation: { x: 2, y: 2, z: 2 },
    position: { x: 2, y: 2, z: 2 },
    scale: { x: 2, y: 2, z: 2 },
    colour: new THREE.Color(0x00ff00)
};

// Scene objects
let cube;
let controls;

function initScene() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    camera.position.z = 5;
    
    // Add lights
    scene.add(new THREE.AmbientLight(0x404040));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
}

function createCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ color: cubeState.colour });
    cube = new THREE.Mesh(geometry, material);
    
    // Set initial properties
    cube.rotation.set(cubeState.rotation.x, cubeState.rotation.y, cubeState.rotation.z);
    cube.position.set(cubeState.position.x, cubeState.position.y, cubeState.position.z);
    cube.scale.set(cubeState.scale.x, cubeState.scale.y, cubeState.scale.z);
    scene.add(cube);
}

function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

function updateCubeState() {
    Object.assign(cubeState.rotation, {
        x: cube.rotation.x,
        y: cube.rotation.y,
        z: cube.rotation.z
    });
    Object.assign(cubeState.position, {
        x: cube.position.x,
        y: cube.position.y,
        z: cube.position.z
    });
    Object.assign(cubeState.scale, {
        x: cube.scale.x,
        y: cube.scale.y,
        z: cube.scale.z
    });
    cubeState.colour = cube.material.color;
}

function animate() {
    requestAnimationFrame(animate);
    updateCubeState();
    
    // Update cube properties from state
    cube.scale.copy(cubeState.scale);
    cube.material.color = cubeState.colour;
    
    controls.update();
    renderer.render(scene, camera);
}

// Event listeners
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Initialize and start
initScene();
createCube();
initControls();
animate();