// Add this at the top of your file
const OBJLoader = THREE.OBJLoader;

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
function loadModelByFormat(url, format) {
    return new Promise((resolve, reject) => {
        const loader = loaders[format];
        
        if (!loader) {
            reject(new Error(`No loader available for format: ${format}`));
            return;
        }

        loader.load(
            url,
            (loadedObject) => {
                // Handle different loader return types
                let modelObject;
                if (loadedObject.scene) {
                    // GLTF/GLB returns { scene }
                    modelObject = loadedObject.scene;
                } else if (Array.isArray(loadedObject)) {
                    // Some loaders return arrays
                    modelObject = new THREE.Group().add(...loadedObject);
                } else {
                    // Direct object return
                    modelObject = loadedObject;
                }

                // Clean up existing object
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

                // Center the model
                const box = new THREE.Box3().setFromObject(modelObject);
                const center = box.getCenter(new THREE.Vector3());
                modelObject.position.sub(center);

                // Apply initial properties
                modelObject.position.set(
                    objectProperties.position.x,
                    objectProperties.position.y,
                    objectProperties.position.z
                );
                modelObject.rotation.set(
                    objectProperties.rotation.x,
                    objectProperties.rotation.y,
                    objectProperties.rotation.z
                );
                modelObject.scale.set(
                    objectProperties.scale.x,
                    objectProperties.scale.y,
                    objectProperties.scale.z
                );

                // Apply materials and color
                modelObject.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({ 
                            color: objectProperties.color 
                        });
                        child.material.userData = {
                            originalColor: objectProperties.color
                        };
                    }
                });

                // Set as current object
                object = modelObject;
                scene.add(object);

                // Setup controls
                transformControls.attach(object);
                transformControls.setMode('translate');

                // Initialize UI
                initializeInputs();
                initializeScaleDisplays();
                updateUIFromObject();

                renderer.render(scene, camera);
                resolve(modelObject);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
}

// ===== File Upload Handler =====
// Add loader definitions at the top
const loaders = {
    'gltf': THREE.GLTFLoader && new THREE.GLTFLoader(),
    'glb': THREE.GLTFLoader && new THREE.GLTFLoader(),
    'obj': THREE.OBJLoader && new THREE.OBJLoader(),
    'fbx': THREE.FBXLoader && new THREE.FBXLoader(),
    'stl': THREE.STLLoader && new THREE.STLLoader(),
    'dae': THREE.ColladaLoader && new THREE.ColladaLoader(),
    'ply': THREE.PLYLoader && new THREE.PLYLoader(),
    '3ds': THREE.TDSLoader && new THREE.TDSLoader(),
    'pcd': THREE.PCDLoader && new THREE.PCDLoader(),
    'vtk': THREE.VTKLoader && new THREE.VTKLoader(),
    'amf': THREE.AMFLoader && new THREE.AMFLoader(),
    '3mf': THREE.ThreeMFLoader && new THREE.ThreeMFLoader(),
    'x': THREE.XLoader && new THREE.XLoader(),
    'json': new THREE.ObjectLoader()
};

// Add supported formats definition
const supportedFormats = {
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.obj': 'model/obj',
    '.fbx': 'model/fbx',
    '.stl': 'model/stl',
    '.dae': 'model/collada',
    '.ply': 'application/x-ply',
    '.3ds': 'application/x-3ds',
    '.3mf': 'model/3mf',
    '.amf': 'application/x-amf',
    '.wrl': 'model/vrml',
    '.vtk': 'model/vtk',
    '.pcd': 'application/x-pcd',
    '.x': 'application/x-directx',
    '.json': 'application/json'
};

// Modified file upload handler
function addModelUpload() {
    const uploadButton = document.getElementById('upload');
    if (!uploadButton) {
        console.warn('Upload button not found');
        return;
    }

    uploadButton.style.cursor = 'pointer';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = Object.keys(supportedFormats).join(',');
    input.style.display = 'none';
    uploadButton.appendChild(input);

    uploadButton.addEventListener('click', () => input.click());

    input.addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div>Loading ${file.name}</div>
                <div class="loading-spinner"></div>
            </div>
        `;
        document.body.appendChild(loadingDiv);

        try {
            const fileURL = URL.createObjectURL(file);
            const extension = file.name.toLowerCase().match(/\.[0-9a-z]+$/)[0];
            const format = extension.substring(1); // Remove the dot

            await loadModelByFormat(fileURL, format);
            URL.revokeObjectURL(fileURL);
        } catch (error) {
            console.error('Loading error:', error);
            alert(`Error loading file: ${error.message}`);
        } finally {
            if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }
        }
    });
}

// Make sure to add the loading indicator styles if not already present
const style = document.createElement('style');
style.textContent = `
    #loading-indicator {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .loading-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
    }
    .loading-spinner {
        margin-top: 10px;
        width: 30px;
        height: 30px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 10px auto;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

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
        border: computedStyle.border,
        backgroundColor: input.value // Set initial background color
    });
    
    input.id = element.id;
    element.parentNode.replaceChild(input, element);

    input.addEventListener('input', function() {
        const colorValue = parseInt(this.value.substring(1), 16);
        // Update the input's background color
        input.style.backgroundColor = this.value;
        // Calculate brightness and set text color
        const r = parseInt(this.value.substr(1,2), 16);
        const g = parseInt(this.value.substr(3,2), 16);
        const b = parseInt(this.value.substr(5,2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        input.style.color = brightness > 128 ? '#000000' : '#ffffff';
        // Call the original update callback
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

    // Update color input
    const colorInput = document.getElementById('field01');
    if (colorInput && object) {
        // Get the current color from the object's material
        let currentColor;
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                currentColor = child.material.color;
            }
        });
        
        if (currentColor) {
            // Convert THREE.js color to hex string
            const hexColor = '#' + currentColor.getHexString();
            colorInput.value = hexColor;
            colorInput.style.backgroundColor = hexColor; // Set background color
            // Set text color to white or black depending on background brightness
            const brightness = (currentColor.r * 299 + currentColor.g * 587 + currentColor.b * 114) / 1000;
            colorInput.style.color = brightness > 0.5 ? '#000000' : '#ffffff';
        }
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

// Update the loadOBJModel function
function loadOBJModel(url) {
    return new Promise((resolve, reject) => {
        // Create new instance of OBJLoader
        const loader = new OBJLoader();
        
        loader.load(
            url,
            (objModel) => {
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

                // Center the model
                const box = new THREE.Box3().setFromObject(objModel);
                const center = box.getCenter(new THREE.Vector3());
                objModel.position.sub(center);

                // Apply initial properties
                objModel.position.set(objectProperties.position.x, objectProperties.position.y, objectProperties.position.z);
                objModel.rotation.set(objectProperties.rotation.x, objectProperties.rotation.y, objectProperties.rotation.z);
                objModel.scale.set(objectProperties.scale.x, objectProperties.scale.y, objectProperties.scale.z);

                // Apply materials and color
                objModel.traverse((child) => {
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
                object = objModel;
                scene.add(object);
                
                // Attach transform controls
                transformControls.attach(object);
                transformControls.setMode('translate');

                // Initialize UI
                initializeInputs();
                initializeScaleDisplays();
                updateUIFromObject();

                renderer.render(scene, camera);
                resolve();
            },
            // Progress callback
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // Error callback
            (error) => {
                console.error('Error loading OBJ:', error);
                reject(error);
            }
        );
    });
}