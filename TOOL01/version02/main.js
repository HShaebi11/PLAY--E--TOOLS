// Constants and scene setup
const container = document.querySelector('#three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Cube state
const cubeState = {
    rotation: { x: THREE.MathUtils.degToRad(120), y: THREE.MathUtils.degToRad(120), z: THREE.MathUtils.degToRad(120) },
    position: { x: 2, y: 2, z: 2 },
    scale: { x: 2, y: 2, z: 2 },
    colour: new THREE.Color(0x00ff00)
};

// Scene objects
let cube;
let controls;

// Create debug display
const debugDisplay = document.createElement('div');
debugDisplay.style.position = 'fixed';
debugDisplay.style.top = '10px';
debugDisplay.style.left = '10px';
debugDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
debugDisplay.style.color = 'white';
debugDisplay.style.padding = '10px';
debugDisplay.style.fontFamily = 'monospace';
debugDisplay.style.fontSize = '12px';
debugDisplay.style.borderRadius = '5px';
document.body.appendChild(debugDisplay);

function updateDebugDisplay() {
    debugDisplay.innerHTML = `
        Rotation: x: ${THREE.MathUtils.radToDeg(cube.rotation.x % (2 * Math.PI)).toFixed(2)}°, 
                 y: ${THREE.MathUtils.radToDeg(cube.rotation.y % (2 * Math.PI)).toFixed(2)}°, 
                 z: ${THREE.MathUtils.radToDeg(cube.rotation.z % (2 * Math.PI)).toFixed(2)}°<br>
        Position: x: ${cube.position.x.toFixed(2)}, y: ${cube.position.y.toFixed(2)}, z: ${cube.position.z.toFixed(2)}<br>
        Scale: x: ${cube.scale.x.toFixed(2)}, y: ${cube.scale.y.toFixed(2)}, z: ${cube.scale.z.toFixed(2)}<br>
        Color: rgb(${Math.round(cube.material.color.r * 255)}, ${Math.round(cube.material.color.g * 255)}, ${Math.round(cube.material.color.b * 255)})
    `;
}

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
    // Get the current rotation in radians and convert to degrees
    cubeState.rotation.x = THREE.MathUtils.radToDeg(cube.rotation.x % (2 * Math.PI));
    cubeState.rotation.y = THREE.MathUtils.radToDeg(cube.rotation.y % (2 * Math.PI));
    cubeState.rotation.z = THREE.MathUtils.radToDeg(cube.rotation.z % (2 * Math.PI));

    // Update position
    cubeState.position.x = cube.position.x;
    cubeState.position.y = cube.position.y;
    cubeState.position.z = cube.position.z;

    // Update scale
    cubeState.scale.x = cube.scale.x;
    cubeState.scale.y = cube.scale.y;
    cubeState.scale.z = cube.scale.z;

    // Update color
    cubeState.colour.copy(cube.material.color);

    updateDebugDisplay();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update the debug display every frame
    updateDebugDisplay();
    
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
