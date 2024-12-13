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
convertToRangeInput('range01', cube.scale.x, -30, 30, 0.5, value => {
    cube.scale.x = value;
    const display = document.getElementById('ValueRange01');
    if (display) display.textContent = value.toFixed(2);
});

convertToRangeInput('range02', cube.scale.y, -30, 30, 0.5, value => {
    cube.scale.y = value;
    const display = document.getElementById('ValueRange02');
    if (display) display.textContent = value.toFixed(2);
});

convertToRangeInput('range03', cube.scale.z, -30, 30, 0.5, value => {
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

// SVG Export functionality
const svgButton = document.getElementById('svgbutton');
if (svgButton) {
    svgButton.style.cursor = 'pointer';
    svgButton.style.userSelect = 'none';
    svgButton.setAttribute('role', 'button');
    svgButton.setAttribute('tabindex', '0');

    svgButton.addEventListener('click', function() {
        console.log('SVG button clicked');

        try {
            // Temporarily hide transform controls
            const wasVisible = transformControls.visible;
            transformControls.visible = false;
            
            // Force a render
            renderer.render(scene, camera);
            
            // Get the canvas data
            const glCanvas = renderer.domElement;
            const canvasWidth = glCanvas.width;
            const canvasHeight = glCanvas.height;
            
            // Create SVG
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', canvasWidth);
            svg.setAttribute('height', canvasHeight);
            svg.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
            
            // Create image element in SVG using canvas data
            const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            img.setAttribute('width', canvasWidth);
            img.setAttribute('height', canvasHeight);
            img.setAttribute('href', glCanvas.toDataURL('image/png'));
            svg.appendChild(img);
            
            // Convert SVG to string
            const svgData = new XMLSerializer().serializeToString(svg);
            
            // Create download link
            const link = document.createElement('a');
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = window.URL.createObjectURL(blob);
            
            // Get current date and time for filename
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();

            link.download = `PLAY(E)—T1—${hours}:${minutes}—${day}${month}${year}.svg`;
            link.href = url;
            link.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            
            // Restore transform controls visibility
            transformControls.visible = wasVisible;
            renderer.render(scene, camera);
            
            console.log('SVG generated successfully');

        } catch (error) {
            console.error('Error generating SVG:', error);
            console.error('Error details:', error.message);
        }
    });

    // Add visual feedback
    svgButton.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.98)';
    });

    svgButton.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });

    svgButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

// Add GLTFLoader
const loader = new THREE.GLTFLoader();

// Convert field00 to file input and add import functionality
function convertToModelInput(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element with id ${elementId} not found`);
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf';
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

    // Import functionality
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const fileURL = URL.createObjectURL(file);
            
            // Load the 3D model
            loader.load(
                fileURL,
                function (gltf) {
                    // Remove existing cube and detach controls
                    transformControls.detach();
                    scene.remove(cube);

                    // Get the model
                    const model = gltf.scene;
                    
                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    // Reset model position to center
                    model.position.set(0, 0, 0);
                    model.updateMatrixWorld();
                    
                    // Adjust model scale to fit in view
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 2 / maxDim;
                    model.scale.multiplyScalar(scale);
                    
                    // Replace cube reference with new model
                    cube = model;
                    
                    // Add to scene and attach controls
                    scene.add(cube);
                    transformControls.attach(cube);
                    
                    // Reset camera position based on model size
                    const distance = maxDim * 2;
                    camera.position.set(distance, distance, distance);
                    camera.lookAt(0, 0, 0);
                    
                    // Reset
                    transformControls.position.set(0, 0, 0);
                    transformControls.quaternion.copy(new THREE.Quaternion());
                    transformControls.scale.set(1, 1, 1);
                    
                    // Cleanup
                    URL.revokeObjectURL(fileURL);
                    
                    console.log('Model imported successfully');
                },
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (error) {
                    console.error('Error loading model:', error);
                    alert('Error loading 3D model. Please check the file.');
                    URL.revokeObjectURL(fileURL);
                }
            );
        } catch (error) {
            console.error('Error importing model:', error);
            alert('Error importing 3D model. Please check the file.');
        }
    });

    return input;
}

// Initialize the model input field
convertToModelInput('field00');