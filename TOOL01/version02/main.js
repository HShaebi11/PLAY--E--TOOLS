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

// Add this function to your code
function convertToNumberInput(elementId, currentValue, minValue, maxValue, stepValue, updateCallback) {
    // Get the element
    const element = document.getElementById(elementId);
    if (!element) return;

    // Create new input element
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.min = minValue;
    input.max = maxValue;
    input.step = stepValue;
    input.style.width = '60px'; // Set a reasonable width

    // Replace the original element with the input
    element.parentNode.replaceChild(input, element);

    // Add event listener for input changes
    input.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (!isNaN(value)) {
            updateCallback(value);
        }
    });

    // Return the input element for reference
    return input;
}

// Example usage for position fields (add after your existing code):
convertToNumberInput('field02', cube.position.x, -10, 10, 0.1, 
    (value) => { cube.position.x = value; });
convertToNumberInput('field03', cube.position.y, -10, 10, 0.1, 
    (value) => { cube.position.y = value; });
convertToNumberInput('field04', cube.position.z, -10, 10, 0.1, 
    (value) => { cube.position.z = value; });

// Example usage for rotation fields
convertToNumberInput('field05', cube.rotation.x, -Math.PI, Math.PI, 0.1, 
    (value) => { cube.rotation.x = value; });
convertToNumberInput('field06', cube.rotation.y, -Math.PI, Math.PI, 0.1, 
    (value) => { cube.rotation.y = value; });
convertToNumberInput('field07', cube.rotation.z, -Math.PI, Math.PI, 0.1, 
    (value) => { cube.rotation.z = value; });

// Modify your animate function to update input values instead of text content
function animate() {
    requestAnimationFrame(animate);
    
    // Update input values only if they don't have focus
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (document.activeElement !== input) {
            switch(input.id) {
                case 'field02': input.value = cube.position.x.toFixed(2); break;
                case 'field03': input.value = cube.position.y.toFixed(2); break;
                case 'field04': input.value = cube.position.z.toFixed(2); break;
                case 'field05': input.value = cube.rotation.x.toFixed(2); break;
                case 'field06': input.value = cube.rotation.y.toFixed(2); break;
                case 'field07': input.value = cube.rotation.z.toFixed(2); break;
            }
        }
    });

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