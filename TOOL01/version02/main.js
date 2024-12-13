// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Get the container element and its dimensions
const container = document.getElementById('three-container');
const containerWidth = container.offsetWidth;
const containerHeight = container.offsetHeight;

// Set up camera with container's aspect ratio
camera.aspect = containerWidth / containerHeight;
camera.updateProjectionMatrix();

// Set renderer size and pixel ratio
renderer.setSize(containerWidth, containerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Variables for Cube properties
let position = {
    x: 0,
    y: 0,
    z: 0
};

let rotation = {
    x: 0,
    y: 0,
    z: 0
};

let scale = {
    x: 1,
    y: 1,
    z: 1
};

let color = 0x00ff00;

// Update cube properties
function updateCube() {
    cube.position.set(position.x, position.y, position.z);
    cube.rotation.set(rotation.x, rotation.y, rotation.z);
    cube.scale.set(scale.x, scale.y, scale.z);
    cube.material.color.setHex(color);
}

// Position camera
camera.position.z = 5;
camera.position.y = 2;
camera.lookAt(0, 0, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Example: Rotate cube
    rotation.x += 0.01;
    rotation.y += 0.01;
    
    updateCube();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const newWidth = container.offsetWidth;
    const newHeight = container.offsetHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});