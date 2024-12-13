// Scene setup
const scene = new THREE.Scene();
const container = document.querySelector('#three-container');
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Position camera
camera.position.z = 5;

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Variables for cube properties
window.rotationX = 10; // Made variables global
window.rotationY = 5;
window.rotationZ = 6;
window.positionX = 2;
window.positionY = 1;
window.positionZ = 0;
window.scale = { x: 1, y: 1, z: 1 };
window.colour = new THREE.Color(0x00ff00); // Green color

// Create cube with initial properties
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial({ color: window.colour });
const cube = new THREE.Mesh(geometry, material);

// Set initial properties
cube.rotation.set(window.rotationX, window.rotationY, window.rotationZ);
cube.position.set(window.positionX, window.positionY, window.positionZ);
cube.scale.set(window.scale.x, window.scale.y, window.scale.z);
scene.add(cube);

// Create a function to update the cube properties
function updateCubeProperties() {
    cube.rotation.set(window.rotationX, window.rotationY, window.rotationZ);
    cube.position.set(window.positionX, window.positionY, window.positionZ);
    cube.scale.set(window.scale.x, window.scale.y, window.scale.z);
    cube.material.color = window.colour;
}

function convertToNumberInput(elementId, minValue, maxValue, stepValue, targetVariable) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id '${elementId}' not found`);
        return;
    }

    // Create container with better styling
    const container = document.createElement('div');
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    `;

    // Create and style label
    const label = document.createElement('label');
    label.textContent = elementId.replace('-control', '').replace(/([A-Z])/g, ' $1').trim();
    label.style.cssText = `
        min-width: 80px;
        color: #ddd;
        font-size: 12px;
    `;

    // Create and style input
    const input = document.createElement('input');
    input.type = 'number';
    input.style.cssText = `
        width: 80px;
        background: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 3px;
        padding: 4px;
        font-size: 12px;
    `;

    // Set input attributes
    input.min = minValue;
    input.max = maxValue;
    input.step = stepValue;

    // Get and set initial value
    const getCurrentValue = () => {
        return window[targetVariable];
    };

    // Set initial value
    input.value = getCurrentValue();

    // Update function with validation
    const updateValue = (newValue) => {
        // Validate and clamp value
        newValue = Math.max(minValue, Math.min(maxValue, newValue));
        
        // Update target variable
        window[targetVariable] = newValue;

        // Update input display
        input.value = newValue;
        
        // Add visual feedback
        input.style.backgroundColor = '#444';
        setTimeout(() => {
            input.style.backgroundColor = '#333';
        }, 200);
    };

    // Input event handler
    input.addEventListener('input', (e) => {
        const newValue = parseFloat(e.target.value);
        if (!isNaN(newValue)) {
            updateValue(newValue);
        }
    });

    // Blur event handler
    input.addEventListener('blur', (e) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) {
            value = getCurrentValue();
        }
        updateValue(value);
    });

    // Key event handler for better UX
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });

    // Assemble container
    container.appendChild(label);
    container.appendChild(input);
    element.parentNode.replaceChild(container, element);

    // Return interface for external control
    return {
        container,
        input,
        label,
        getValue: getCurrentValue,
        setValue: updateValue
    };
}

// Handle window resize
window.addEventListener('resize', () => {
    const container = document.querySelector('#three-container'); // Fixed selector
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Animation loop to update cube properties
function animate() {
    requestAnimationFrame(animate);
    updateCubeProperties();
    controls.update();
    renderer.render(scene, camera);
}

// Initialize number inputs
convertToNumberInput('input01', 0, 30, 2, 'rotationX');
convertToNumberInput('input02', 0, 30, 2, 'rotationY');
convertToNumberInput('input03', 0, 30, 2, 'rotationZ');
convertToNumberInput('input04', 0, 30, 2, 'positionX');
convertToNumberInput('input05', 0, 30, 2, 'positionY');
convertToNumberInput('input06', 0, 30, 2, 'positionZ');

// Start animation
animate();