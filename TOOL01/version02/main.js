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

// Animation loop without automatic movement
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Add keyboard controls for cube movement
document.addEventListener('keydown', (event) => {
    const speed = 0.1;
    switch(event.key) {
        case 'ArrowUp':
            cubeProperties.position.y += speed;
            cube.position.y = cubeProperties.position.y;
            break;
        case 'ArrowDown':
            cubeProperties.position.y -= speed;
            cube.position.y = cubeProperties.position.y;
            break;
        case 'ArrowLeft':
            cubeProperties.position.x -= speed;
            cube.position.x = cubeProperties.position.x;
            break;
        case 'ArrowRight':
            cubeProperties.position.x += speed;
            cube.position.x = cubeProperties.position.x;
            break;
        case 'PageUp':
            cubeProperties.position.z -= speed;
            cube.position.z = cubeProperties.position.z;
            break;
        case 'PageDown':
            cubeProperties.position.z += speed;
            cube.position.z = cubeProperties.position.z;
            break;
    }
});

// Mouse control variables
let isDragging = false;
let isRotating = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

// Add mouse event listeners
renderer.domElement.addEventListener('mousedown', (e) => {
    // Left click for position, right click for rotation
    if (e.button === 0) {
        isDragging = true;
    } else if (e.button === 2) {
        isRotating = true;
        // Prevent context menu from showing up
        e.preventDefault();
    }
    
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

renderer.domElement.addEventListener('mousemove', (e) => {
    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };

    if (isDragging) {
        // Position movement
        const movementSpeed = 0.01;
        
        cubeProperties.position.x += deltaMove.x * movementSpeed;
        cubeProperties.position.y -= deltaMove.y * movementSpeed;
        
        cube.position.set(
            cubeProperties.position.x,
            cubeProperties.position.y,
            cubeProperties.position.z
        );
    }

    if (isRotating) {
        // Rotation movement
        const rotationSpeed = 0.01;
        
        cubeProperties.rotation.x += deltaMove.y * rotationSpeed;
        cubeProperties.rotation.y += deltaMove.x * rotationSpeed;
        
        cube.rotation.set(
            cubeProperties.rotation.x,
            cubeProperties.rotation.y,
            cubeProperties.rotation.z
        );
    }

    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

renderer.domElement.addEventListener('mouseup', (e) => {
    if (e.button === 0) isDragging = false;
    if (e.button === 2) isRotating = false;
});

renderer.domElement.addEventListener('mouseleave', () => {
    isDragging = false;
    isRotating = false;
});

// Prevent context menu from showing up on right click
renderer.domElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Handle window resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});