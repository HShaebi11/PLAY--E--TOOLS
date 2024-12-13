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
convertToRangeInput('range01', cube.scale.x, -5, 5, 0.5, value => {
    cube.scale.x = value;
    const display = document.getElementById('ValueRange01');
    if (display) display.textContent = value.toFixed(2);
});

convertToRangeInput('range02', cube.scale.y, -5, 5, 0.5, value => {
    cube.scale.y = value;
    const display = document.getElementById('ValueRange02');
    if (display) display.textContent = value.toFixed(2);
});

convertToRangeInput('range03', cube.scale.z, -5, 5, 0.5, value => {
    cube.scale.z = value;
    const display = document.getElementById('ValueRange03');
    if (display) display.textContent = value.toFixed(2);
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

// Update number input fields when transform controls change
function updateNumberInputs() {
    // Position
    const posFields = {
        'field02': cube.position.x,
        'field03': cube.position.y,
        'field04': cube.position.z
    };
    
    // Rotation
    const rotFields = {
        'field05': cube.rotation.x,
        'field06': cube.rotation.y,
        'field07': cube.rotation.z
    };
    
    Object.entries(posFields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) input.value = value.toFixed(2);
    });
    
    Object.entries(rotFields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) input.value = value.toFixed(2);
    });
}

// Add the update to transform controls
transformControls.addEventListener('objectChange', () => {
    updateRangeInputs();
    updateNumberInputs();
});

// PDF Export functionality
const pdfButton = document.getElementById('pdfbutton');
if (pdfButton) {
    // Make div behave like a button
    pdfButton.style.cursor = 'pointer';
    pdfButton.style.userSelect = 'none';  // Prevent text selection
    pdfButton.setAttribute('role', 'button');  // Accessibility
    pdfButton.setAttribute('tabindex', '0');   // Make it focusable

    // Add keyboard support for accessibility
    pdfButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });

    // Add visual feedback on interaction
    pdfButton.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.98)';
    });

    pdfButton.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });

    pdfButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });

    pdfButton.addEventListener('click', function() {
        console.log('PDF button clicked');

        try {
            // Temporarily hide transform controls
            const wasVisible = transformControls.visible;
            transformControls.visible = false;
            
            // Force a render to update the view without gizmo
            renderer.render(scene, camera);
            
            // Get the WebGL canvas
            const glCanvas = renderer.domElement;
            
            // Get canvas dimensions
            const canvasWidth = glCanvas.width;
            const canvasHeight = glCanvas.height;
            
            // Get the image data
            const imgData = glCanvas.toDataURL('image/png');
            
            // Create PDF with canvas dimensions
            const doc = new jspdf.jsPDF({
                orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvasWidth, canvasHeight]
            });

            // Get current date and time
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();

            const filename = `PLAY(E)—T1—${hours}:${minutes}—${day}${month}${year}.pdf`;

            // Add the image to PDF with exact canvas dimensions
            doc.addImage(imgData, 'PNG', 0, 0, canvasWidth, canvasHeight);
            
            // Save the PDF
            doc.save(filename);
            
            // Restore transform controls visibility
            transformControls.visible = wasVisible;
            
            // Re-render to show gizmo again
            renderer.render(scene, camera);
            
            console.log('PDF generated successfully');

        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error details:', error.message);
        }
    });
}