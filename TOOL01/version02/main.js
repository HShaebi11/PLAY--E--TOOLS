// Scene setup
const scene = new THREE.Scene();
const container = document.querySelector('#three-container');
const camera = new THREE.PerspectiveCamera(100, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Variables for cube properties
let rotationX = 0;
let rotationY = 0; 
let rotationZ = 0;
let positionX = 0;
let positionY = 0;
let positionZ = 0;
let scaleX = 3;
let scaleY = 3;
let scaleZ = 3;
let colour = new THREE.Color(0x00ff00); // Green color
let cameraPositionX = 0;  // Add camera X position
let cameraPositionY = 0;  // Add camera Y position
let cameraPositionZ = 5;  // Existing camera Z position

// Light variables
let ambientLightColor = 0x404040;
let ambientLightIntensity = 1;
let directionalLightColor = 0xffffff;
let directionalLightIntensity = 1;
let directionalLightX = 1;
let directionalLightY = 1;
let directionalLightZ = 1;

// Create cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial({ color: colour });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(positionX, positionY, positionZ);
cube.scale.set(scaleX, scaleY, scaleZ);
scene.add(cube);

// Add lights
const ambientLight = new THREE.AmbientLight(ambientLightColor, ambientLightIntensity);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(directionalLightColor, directionalLightIntensity);
directionalLight.position.set(directionalLightX, directionalLightY, directionalLightZ);
scene.add(directionalLight);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Position camera
camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update cube rotation
    cube.rotation.x += rotationX;
    cube.rotation.y += rotationY;
    cube.rotation.z += rotationZ;
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    const container = document.querySelector('.three-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Start animation
animate();

