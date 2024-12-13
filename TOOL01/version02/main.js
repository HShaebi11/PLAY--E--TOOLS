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

// ===== Initial Properties =====
const objectProperties = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: 0x00ff00
};

// ===== Model Setup =====
let object; // Will store our current model
const loader = new THREE.GLTFLoader();

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
    renderer.render(scene, camera);
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
            if (object) {
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
            }

            const model = gltf.scene;
            
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Apply initial properties
            model.position.set(objectProperties.position.x, objectProperties.position.y, objectProperties.position.z);
            model.rotation.set(objectProperties.rotation.x, objectProperties.rotation.y, objectProperties.rotation.z);
            model.scale.set(objectProperties.scale.x, objectProperties.scale.y, objectProperties.scale.z);

            // Apply materials and color
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({ 
                        color: objectProperties.color 
                    });
                    child.material.userData = {
                        originalColor: objectProperties.color
                    };
                }
            });

            // Add to scene and setup controls
            object = model;
            scene.add(object);
            
            // Attach transform controls
            transformControls.attach(object);
            transformControls.setMode('translate');

            // Initialize UI only after object is loaded
            initializeInputs();
            initializeScaleDisplays();
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
// Move these initial input conversions inside a function
function initializeInputs() {
    if (!object) return; // Don't initialize if no object exists

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
}

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

    document.getElementById('ValueRange01').textContent = object.scale.x.toFixed(2);
    document.getElementById('ValueRange02').textContent = object.scale.y.toFixed(2);
    document.getElementById('ValueRange03').textContent = object.scale.z.toFixed(2);
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

// ===== Export Functions =====
function setupExportButtons() {
    const pdfButton = document.getElementById('pdfbutton');
    const svgButton = document.getElementById('svgbutton');

    if (!pdfButton || !svgButton) {
        console.error('Export buttons not found');
        return;
    }

    pdfButton.addEventListener('click', async function() {
        if (!object) {
            alert('Please load a 3D model first');
            return;
        }

        // Hide transform controls temporarily
        const wasVisible = transformControls.visible;
        transformControls.visible = false;
        renderer.render(scene, camera);

        try {
            // Get the canvas data
            const canvas = renderer.domElement;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            // Add the image
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

            // Convert to blob and force download
            const pdfBlob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = `3d-model-${timestamp}.pdf`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Failed to export PDF. Please check console for details.');
        } finally {
            // Restore transform controls
            transformControls.visible = wasVisible;
            renderer.render(scene, camera);
        }
    });

    svgButton.addEventListener('click', function() {
        if (!object) {
            alert('Please load a 3D model first');
            return;
        }

        // Hide transform controls temporarily
        const wasVisible = transformControls.visible;
        transformControls.visible = false;
        renderer.render(scene, camera);

        try {
            // Get the container dimensions in pixels
            const container = document.querySelector('#three-container');
            const containerStyle = window.getComputedStyle(container);
            const containerWidth = parseFloat(containerStyle.width);
            const containerHeight = parseFloat(containerStyle.height);
            
            // Get the canvas
            const canvas = renderer.domElement;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Get canvas data as PNG
            const imgData = canvas.toDataURL('image/png');
            
            // Create SVG wrapper with explicit pixel dimensions
            const svgContent = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${containerWidth}px" height="${containerHeight}px" viewBox="0 0 ${containerWidth} ${containerHeight}">
                    <image x="0" y="0" width="${containerWidth}" height="${containerHeight}" href="${imgData}"/>
                </svg>
            `;
            
            // Create blob and force download
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const blobUrl = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = `3d-model-${timestamp}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

        } catch (error) {
            console.error('SVG Export Error:', error);
            alert('Failed to export SVG. Please check console for details.');
        } finally {
            // Restore transform controls
            transformControls.visible = wasVisible;
            renderer.render(scene, camera);
        }
    });
}

// Initialize export buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load jsPDF library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = setupExportButtons;
    script.onerror = () => console.error('Failed to load jsPDF library');
    document.head.appendChild(script);
});

// Add this to your existing window resize handler
window.addEventListener('resize', function() {
    handleResize();
    if (object) {
        renderer.render(scene, camera);
    }
});

// Add a new function to safely initialize scale displays
function initializeScaleDisplays() {
    if (!object) return;  // Guard clause
    
    ['01', '02', '03'].forEach(suffix => {
        const valueDisplay = document.getElementById(`ValueRange${suffix}`);
        if (valueDisplay) {
            const axis = ['x', 'y', 'z'][parseInt(suffix) - 1];
            valueDisplay.textContent = object.scale[axis].toFixed(2);
        }
    });
}