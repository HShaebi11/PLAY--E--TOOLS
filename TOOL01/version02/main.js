// Scene setup
const scene = new THREE.Scene();
const container = document.querySelector('#three-container');
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
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
let scaleX = 1;
let scaleY = 1;
let scaleZ = 1;
let colour = new THREE.Color(0x00ff00); // Green color

// Create cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial({ color: colour });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(positionX, positionY, positionZ);
cube.scale.set(scaleX, scaleY, scaleZ);
scene.add(cube);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Position camera
camera.position.z = 5;

// Add input variable
let inputValue = '';

// Add input event listener
const input01 = document.getElementById('input01');
input01.addEventListener('input', (event) => {
    inputValue = event.target.value;
    
    // Update cube properties based on input length
    const length = inputValue.length;
    
    // Scale cube based on input length
    cube.scale.set(1 + length * 0.1, 1 + length * 0.1, 1 + length * 0.1);
    
    // Change color based on input length
    const hue = (length * 30) % 360;
    cube.material.color.setHSL(hue/360, 1, 0.5);
});

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

