// Create scene, camera and renderer
const scene = new THREE.Scene();
const container = document.querySelector('#three-container');
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Set renderer element to fill container
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Control variables
const cubeProperties = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: 0x00ff00
};

// Create a cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: cubeProperties.color });
const cube = new THREE.Mesh(geometry, material);

// Apply initial properties
cube.position.set(cubeProperties.position.x, cubeProperties.position.y, cubeProperties.position.z);
cube.rotation.set(cubeProperties.rotation.x, cubeProperties.rotation.y, cubeProperties.rotation.z);
cube.scale.set(cubeProperties.scale.x, cubeProperties.scale.y, cubeProperties.scale.z);

scene.add(cube);

// Position camera
camera.position.z = 5;

// Add TransformControls
const transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.attach(cube);
scene.add(transformControls);

// Add keyboard controls for transform modes
document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
        case 'g':
            transformControls.setMode('translate');
            break;
        case 'r':
            transformControls.setMode('rotate');
            break;
        case 's':
            transformControls.setMode('scale');
            break;
    }
});

// Create info plane (disabled)
function createInfoPlane() {
    return {
        mesh: new THREE.Object3D(), // Return empty object
        update: () => {} // Empty update function
    };
}

// Create and add the info plane to the scene (disabled)
const infoPlane = createInfoPlane();
scene.add(infoPlane.mesh);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update the text inside the element with id field02 with value of cube.position.x
    document.getElementById('field02').textContent = cube.position.x.toFixed(2);
    
    // Update the text inside the element with id field03 with value of cube.position.y
    document.getElementById('field03').textContent = cube.position.y.toFixed(2);
    
    // Update the text inside the element with id field04 with value of cube.position.z
    document.getElementById('field04').textContent = cube.position.z.toFixed(2);

    // Update the text inside the element with id field05 with value of cube.rotation.x
    document.getElementById('field05').textContent = cube.rotation.x.toFixed(2);
    
    // Update the text inside the element with id field06 with value of cube.rotation.y
    document.getElementById('field06').textContent = cube.rotation.y.toFixed(2);
    
    // Update the text inside the element with id field07 with value of cube.rotation.z
    document.getElementById('field07').textContent = cube.rotation.z.toFixed(2);
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});