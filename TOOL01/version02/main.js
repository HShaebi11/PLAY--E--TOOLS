// Scene setup
const scene = new THREE.Scene();
const container = document.querySelector('#three-container');
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true 
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000, 0); // transparent background
container.appendChild(renderer.domElement);

// Make renderer responsive
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Cube properties and creation
const cubeProperties = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: 0x00ff00
};

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: cubeProperties.color });
const cube = new THREE.Mesh(geometry, material);

// Apply initial cube properties
cube.position.set(cubeProperties.position.x, cubeProperties.position.y, cubeProperties.position.z);
cube.rotation.set(cubeProperties.rotation.x, cubeProperties.rotation.y, cubeProperties.rotation.z);
cube.scale.set(cubeProperties.scale.x, cubeProperties.scale.y, cubeProperties.scale.z);
scene.add(cube);

// Camera setup
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Controls setup
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.attach(cube);
scene.add(transformControls);

// Input conversion utilities
function convertToNumberInput(elementId, currentValue, minValue, maxValue, stepValue, updateCallback) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element with id ${elementId} not found`);
        return;
    }

    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.min = minValue;
    input.max = maxValue;
    input.step = stepValue;
    input.className = 'field';
    
    const computedStyle = window.getComputedStyle(element);
    Object.assign(input.style, {
        width: computedStyle.width,
        height: computedStyle.height,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        border: computedStyle.border,
        fontSize: computedStyle.fontSize,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor
    });
    
    input.id = element.id;
    element.parentNode.replaceChild(input, element);

    input.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (!isNaN(value)) {
            updateCallback(value);
        }
    });

    return input;
}

function convertToColorInput(elementId, currentColor, updateCallback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const input = document.createElement('input');
    input.type = 'color';
    input.value = '#' + currentColor.toString(16).padStart(6, '0');
    input.className = 'field';
    
    const computedStyle = window.getComputedStyle(element);
    Object.assign(input.style, {
        width: computedStyle.width,
        height: computedStyle.height,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        border: computedStyle.border
    });
    
    input.id = element.id;
    element.parentNode.replaceChild(input, element);

    input.addEventListener('input', function() {
        const colorValue = parseInt(this.value.substring(1), 16);
        updateCallback(colorValue);
    });

    return input;
}

function convertToRangeInput(elementId, currentValue, minValue, maxValue, stepValue, updateCallback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const input = document.createElement('input');
    input.type = 'range';
    input.value = currentValue;
    input.min = minValue;
    input.max = maxValue;
    input.step = stepValue;
    input.className = 'field';
    
    const computedStyle = window.getComputedStyle(element);
    input.style.width = computedStyle.width;
    input.style.margin = computedStyle.margin;
    
    input.id = element.id;
    element.parentNode.replaceChild(input, element);

    input.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (!isNaN(value)) {
            updateCallback(value);
        }
    });

    return input;
}

// Initialize inputs
// Position inputs
convertToNumberInput('field02', cube.position.x, -10, 10, 0.1, value => cube.position.x = value);
convertToNumberInput('field03', cube.position.y, -10, 10, 0.1, value => cube.position.y = value);
convertToNumberInput('field04', cube.position.z, -10, 10, 0.1, value => cube.position.z = value);

// Rotation inputs
convertToNumberInput('field05', cube.rotation.x, -Math.PI, Math.PI, 0.1, value => cube.rotation.x = value);
convertToNumberInput('field06', cube.rotation.y, -Math.PI, Math.PI, 0.1, value => cube.rotation.y = value);
convertToNumberInput('field07', cube.rotation.z, -Math.PI, Math.PI, 0.1, value => cube.rotation.z = value);

// Color input
convertToColorInput('field01', cubeProperties.color, value => {
    cubeProperties.color = value;
    material.color.setHex(value);
});

// Scale inputs
convertToRangeInput('range01', cube.scale.x, -5, 5, 1, value => {
    cube.scale.x = value;
    document.getElementById('ValueRange01').textContent = value.toFixed(2);
});
convertToRangeInput('range02', cube.scale.y, -5, 5, 1, value => {
    cube.scale.y = value;
    document.getElementById('ValueRange02').textContent = value.toFixed(2);
});
convertToRangeInput('range03', cube.scale.z, -5, 5, 1, value => {
    cube.scale.z = value;
    document.getElementById('ValueRange03').textContent = value.toFixed(2);
});

// Event handlers
function updateRangeInputs() {
    ['01', '02', '03'].forEach(suffix => {
        const range = document.getElementById(`range${suffix}`);
        const valueDisplay = document.getElementById(`ValueRange${suffix}`);
        const axis = ['x', 'y', 'z'][parseInt(suffix) - 1];
        const value = cube.scale[axis];
        
        if (range) {
            range.value = value;
        }
        if (valueDisplay) {
            valueDisplay.textContent = value.toFixed(2);
        }
    });
}

function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
}

function handleKeyDown(event) {
    const modes = {
        'g': 'translate',
        'r': 'rotate',
        's': 'scale'
    };
    const mode = modes[event.key.toLowerCase()];
    if (mode) {
        transformControls.setMode(mode);
    }
}

// Event listeners
window.addEventListener('resize', handleResize);
document.addEventListener('keydown', handleKeyDown);
transformControls.addEventListener('objectChange', updateRangeInputs);
transformControls.addEventListener('dragging-changed', event => controls.enabled = !event.value);

// Initialize scale display with error checking
['01', '02', '03'].forEach(suffix => {
    const valueDisplay = document.getElementById(`ValueRange${suffix}`);
    if (valueDisplay) {
        const axis = ['x', 'y', 'z'][parseInt(suffix) - 1];
        valueDisplay.textContent = cube.scale[axis].toFixed(2);
    } else {
        console.warn(`Element ValueRange${suffix} not found`);
    }
});

// Cleanup function
function cleanup() {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('keydown', handleKeyDown);
    controls.dispose();
    transformControls.dispose();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();