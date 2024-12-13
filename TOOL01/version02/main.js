// ===== Scene, Camera, and Renderer Setup =====
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
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';

// ===== Lighting Setup =====
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// ===== Model Loading Setup =====
const loader = new THREE.GLTFLoader();

// ===== Initial Properties =====
const objectProperties = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: 0x00ff00
};

// ===== Initial Object Setup =====
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: objectProperties.color });
let object = new THREE.Mesh(geometry, material);

// Add initial object to scene
scene.add(object);

// Initialize object properties
object.position.set(objectProperties.position.x, objectProperties.position.y, objectProperties.position.z);
object.rotation.set(objectProperties.rotation.x, objectProperties.rotation.y, objectProperties.rotation.z);
object.scale.set(objectProperties.scale.x, objectProperties.scale.y, objectProperties.scale.z);

// ===== Camera and Controls Setup =====
// Fixed camera position
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Remove OrbitControls completely
// const controls = new THREE.OrbitControls(camera, renderer.domElement);
// Instead, make the camera completely static

// Transform controls setup with fixed camera
const transformControls = new THREE.TransformControls(camera, renderer.domElement);
scene.add(transformControls);

// Simplified animation loop without orbit controls
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Transform controls event listeners
transformControls.addEventListener('change', function() {
    if (object) {
        renderer.render(scene, camera);
    }
});

transformControls.addEventListener('objectChange', function() {
    if (object) {
        updateUIFromObject();
    }
});

// Keyboard shortcuts for transform modes
document.addEventListener('keydown', function(event) {
    switch(event.key.toLowerCase()) {
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

// ===== Model Loading Function =====
function loadModel(url) {
    loader.load(
        url,
        function (gltf) {
            // Store current transforms
            const currentPosition = object.position.clone();
            const currentRotation = object.rotation.clone();
            const currentScale = object.scale.clone();
            const currentColor = objectProperties.color;

            // Clean up existing object
            transformControls.detach();
            scene.remove(object);
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }

            // Setup new model
            const model = gltf.scene;
            
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Apply previous transforms
            model.position.copy(currentPosition);
            model.rotation.copy(currentRotation);
            model.scale.copy(currentScale);

            // Apply materials
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({ 
                        color: currentColor 
                    });
                    child.material.userData = {
                        originalColor: currentColor
                    };
                }
            });

            // Update scene
            object = model;
            scene.add(object);
            transformControls.attach(object);

            // Update UI
            reinitializeInputs();
            initializeColorInput();
            updateUIFromObject();

            renderer.render(scene, camera);
        },
        undefined,
        function (error) {
            console.error('Error loading model:', error);
            alert('Failed to load model');
        }
    );
}

// ===== File Upload Handler =====
function addModelUpload() {
    const uploadButton = document.getElementById('upload');
    if (!uploadButton) {
        console.warn('Upload button not found');
        return;
    }

    uploadButton.style.cursor = 'pointer';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf';
    input.style.display = 'none';
    uploadButton.appendChild(input);

    uploadButton.addEventListener('click', () => input.click());

    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            loadModel(fileURL);
            URL.revokeObjectURL(fileURL); // Clean up the URL
        }
    });
}

// Initialize upload functionality
addModelUpload();

// ===== Input Reinitialization =====
function reinitializeInputs() {
    // Position inputs
    convertToNumberInput('field02', object.position.x, -10, 10, 0.1, value => {
        object.position.x = value;
        renderer.render(scene, camera);
    });
    convertToNumberInput('field03', object.position.y, -10, 10, 0.1, value => {
        object.position.y = value;
        renderer.render(scene, camera);
    });
    convertToNumberInput('field04', object.position.z, -10, 10, 0.1, value => {
        object.position.z = value;
        renderer.render(scene, camera);
    });

    // Rotation inputs
    convertToNumberInput('field05', object.rotation.x, -Math.PI, Math.PI, 0.1, value => {
        object.rotation.x = value;
        renderer.render(scene, camera);
    });
    convertToNumberInput('field06', object.rotation.y, -Math.PI, Math.PI, 0.1, value => {
        object.rotation.y = value;
        renderer.render(scene, camera);
    });
    convertToNumberInput('field07', object.rotation.z, -Math.PI, Math.PI, 0.1, value => {
        object.rotation.z = value;
        renderer.render(scene, camera);
    });

    // Scale inputs
    convertToRangeInput('range01', object.scale.x, -30, 30, 0.5, value => {
        object.scale.x = value;
        const display = document.getElementById('ValueRange01');
        if (display) display.textContent = value.toFixed(2);
        renderer.render(scene, camera);
    });

    convertToRangeInput('range02', object.scale.y, -30, 30, 0.5, value => {
        object.scale.y = value;
        const display = document.getElementById('ValueRange02');
        if (display) display.textContent = value.toFixed(2);
        renderer.render(scene, camera);
    });

    convertToRangeInput('range03', object.scale.z, -30, 30, 0.5, value => {
        object.scale.z = value;
        const display = document.getElementById('ValueRange03');
        if (display) display.textContent = value.toFixed(2);
        renderer.render(scene, camera);
    });
}

// ===== Input Conversion Utilities =====
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
    if (!element) {
        console.warn(`Color input element ${elementId} not found`);
        return;
    }

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

// ===== Input Initialization =====
// Position inputs
convertToNumberInput('field02', object.position.x, -10, 10, 0.1, value => object.position.x = value);
convertToNumberInput('field03', object.position.y, -10, 10, 0.1, value => object.position.y = value);
convertToNumberInput('field04', object.position.z, -10, 10, 0.1, value => object.position.z = value);

// Rotation inputs
convertToNumberInput('field05', object.rotation.x, -Math.PI, Math.PI, 0.1, value => object.rotation.x = value);
convertToNumberInput('field06', object.rotation.y, -Math.PI, Math.PI, 0.1, value => object.rotation.y = value);
convertToNumberInput('field07', object.rotation.z, -Math.PI, Math.PI, 0.1, value => object.rotation.z = value);

// Color input
convertToColorInput('field01', objectProperties.color, value => {
    objectProperties.color = value;
    if (object) {
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setHex(value);
                child.material.userData.originalColor = value;
            }
        });
    }
    renderer.render(scene, camera);
});

// Scale inputs
convertToRangeInput('range01', object.scale.x, -30, 30, 0.5, value => {
    object.scale.x = value;
    const display = document.getElementById('ValueRange01');
    if (display) display.textContent = value.toFixed(2);
});

convertToRangeInput('range02', object.scale.y, -30, 30, 0.5, value => {
    object.scale.y = value;
    const display = document.getElementById('ValueRange02');
    if (display) display.textContent = value.toFixed(2);
});

convertToRangeInput('range03', object.scale.z, -30, 30, 0.5, value => {
    object.scale.z = value;
    const display = document.getElementById('ValueRange03');
    if (display) display.textContent = value.toFixed(2);
});

// ===== Event Handlers =====
function updateRangeInputs() {
    ['01', '02', '03'].forEach(suffix => {
        const range = document.getElementById(`range${suffix}`);
        const valueDisplay = document.getElementById(`ValueRange${suffix}`);
        const axis = ['x', 'y', 'z'][parseInt(suffix) - 1];
        const value = object.scale[axis];
        
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

// ===== Event Listeners =====
window.addEventListener('resize', handleResize);
document.addEventListener('keydown', handleKeyDown);
transformControls.addEventListener('objectChange', () => {
    if (object) {
        // Update position inputs
        const posInputs = {
            'field02': object.position.x,
            'field03': object.position.y,
            'field04': object.position.z
        };

        // Update rotation inputs
        const rotInputs = {
            'field05': object.rotation.x,
            'field06': object.rotation.y,
            'field07': object.rotation.z
        };

        // Update scale inputs
        const scaleInputs = {
            'range01': object.scale.x,
            'range02': object.scale.y,
            'range03': object.scale.z
        };

        // Update position and rotation number inputs
        Object.entries(posInputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) input.value = value.toFixed(2);
        });

        Object.entries(rotInputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) input.value = value.toFixed(2);
        });

        // Update scale range inputs and their displays
        Object.entries(scaleInputs).forEach(([id, value], index) => {
            const input = document.getElementById(id);
            const display = document.getElementById(`ValueRange0${index + 1}`);
            if (input) input.value = value;
            if (display) display.textContent = value.toFixed(2);
        });
    }
});
transformControls.addEventListener('dragging-changed', event => controls.enabled = !event.value);

// Initialize scale display
['01', '02', '03'].forEach(suffix => {
    const valueDisplay = document.getElementById(`ValueRange${suffix}`);
    if (valueDisplay) {
        const axis = ['x', 'y', 'z'][parseInt(suffix) - 1];
        valueDisplay.textContent = object.scale[axis].toFixed(2);
    } else {
        console.warn(`Element ValueRange${suffix} not found`);
    }
});

// ===== Animation and Rendering =====
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// ===== UI Updates =====
function updateNumberInputs() {
    const posFields = {
        'field02': object.position.x,
        'field03': object.position.y,
        'field04': object.position.z
    };
    
    const rotFields = {
        'field05': object.rotation.x,
        'field06': object.rotation.y,
        'field07': object.rotation.z
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

// ===== Export Functionality =====
// PDF Export
document.getElementById('pdfbutton').addEventListener('click', function() {
    console.log('PDF export started');
    try {
        // Hide transform controls temporarily
        const wasVisible = transformControls.visible;
        transformControls.visible = false;
        renderer.render(scene, camera);
        
        // Get canvas data
        const canvas = renderer.domElement;
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF using the correct jsPDF reference
        const pdf = new window.jspdf.jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        // Generate filename with timestamp
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
        const filename = `PLAY(E)-T1-${timestamp}.pdf`;

        // Add image and save
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(filename);
        
        // Restore transform controls
        transformControls.visible = wasVisible;
        renderer.render(scene, camera);
        
        console.log('PDF export completed');
    } catch (error) {
        console.error('PDF Export Error:', error);
        alert('Failed to export PDF');
    }
});

// SVG Export
document.getElementById('svgbutton').addEventListener('click', function() {
    console.log('SVG export started');
    try {
        // Hide transform controls temporarily
        const wasVisible = transformControls.visible;
        transformControls.visible = false;
        renderer.render(scene, camera);
        
        // Get canvas data
        const canvas = renderer.domElement;
        const imgData = canvas.toDataURL('image/png');
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', canvas.width);
        svg.setAttribute('height', canvas.height);
        svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
        
        // Add image to SVG
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('width', canvas.width);
        img.setAttribute('height', canvas.height);
        img.setAttribute('href', imgData);
        svg.appendChild(img);
        
        // Generate filename with timestamp
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
        const filename = `PLAY(E)-T1-${timestamp}.svg`;

        // Create download link
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        transformControls.visible = wasVisible;
        renderer.render(scene, camera);
        
        console.log('SVG export completed');
    } catch (error) {
        console.error('SVG Export Error:', error);
        alert('Failed to export SVG');
    }
});

// ===== Cleanup =====
function cleanup() {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('keydown', handleKeyDown);
    controls.dispose();
    transformControls.dispose();
}

// Transform Controls Event Listeners
transformControls.addEventListener('dragging-changed', event => {
    controls.enabled = !event.value;
});

transformControls.addEventListener('objectChange', () => {
    if (object) {
        updateUIFromObject();
    }
});

// Function to update UI from object properties
function updateUIFromObject() {
    if (!object) return;

    try {
        // Update position inputs
        document.getElementById('field02').value = object.position.x.toFixed(2);
        document.getElementById('field03').value = object.position.y.toFixed(2);
        document.getElementById('field04').value = object.position.z.toFixed(2);

        // Update rotation inputs
        document.getElementById('field05').value = object.rotation.x.toFixed(2);
        document.getElementById('field06').value = object.rotation.y.toFixed(2);
        document.getElementById('field07').value = object.rotation.z.toFixed(2);

        // Update scale inputs and displays
        const scaleX = document.getElementById('range01');
        const scaleY = document.getElementById('range02');
        const scaleZ = document.getElementById('range03');
        
        if (scaleX) scaleX.value = object.scale.x;
        if (scaleY) scaleY.value = object.scale.y;
        if (scaleZ) scaleZ.value = object.scale.z;

        // Update scale displays
        const displayX = document.getElementById('ValueRange01');
        const displayY = document.getElementById('ValueRange02');
        const displayZ = document.getElementById('ValueRange03');

        if (displayX) displayX.textContent = object.scale.x.toFixed(2);
        if (displayY) displayY.textContent = object.scale.y.toFixed(2);
        if (displayZ) displayZ.textContent = object.scale.z.toFixed(2);
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Keyboard controls for transform modes
document.addEventListener('keydown', function(event) {
    switch(event.key.toLowerCase()) {
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

// Update the color input initialization and handling
function initializeColorInput() {
    convertToColorInput('field01', objectProperties.color, value => {
        objectProperties.color = value;
        if (object) {
            object.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color.setHex(value);
                    child.material.userData.originalColor = value;
                }
            });
        }
        renderer.render(scene, camera);
    });
}

// Make sure to initialize color input when the page loads
initializeColorInput();

