// Add debug checks at the start of your file
console.log('THREE loaded:', typeof THREE !== 'undefined');
console.log('GLTFLoader loaded:', typeof GLTFLoader !== 'undefined');
console.log('OrbitControls loaded:', typeof THREE.OrbitControls !== 'undefined');
console.log('TransformControls loaded:', typeof THREE.TransformControls !== 'undefined');

// Add WebGL compatibility check at the start
if (!THREE.WEBGL.isWebGLAvailable()) {
    const warning = THREE.WEBGL.getWebGLErrorMessage();
    document.getElementById('three-container').appendChild(warning);
}

// Set up renderer with specific Safari-friendly settings
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true
});

// Add pixel ratio handling for Retina displays
renderer.setPixelRatio(window.devicePixelRatio);

// Start directly with Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Enhance lighting setup
const light = new THREE.DirectionalLight(0xffffff, 2); // Increased intensity
light.position.set(5, 5, 5);
scene.add(light);

// Add more lights for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Brighter ambient light
scene.add(ambientLight);

// Add a point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// Get parent element dimensions
const container = document.getElementById('three-container');
if (!container) {
    console.error('Could not find three-container element');
    // Create container if it doesn't exist
    const newContainer = document.createElement('div');
    newContainer.id = 'three-container';
    newContainer.style.width = '100vw';
    newContainer.style.height = '100vh';
    document.body.appendChild(newContainer);
}

const parentWidth = container.clientWidth || window.innerWidth;
const parentHeight = container.clientHeight || window.innerHeight;

renderer.setSize(parentWidth, parentHeight);
container.appendChild(renderer.domElement);

// Add GLTFLoader
const loader = new GLTFLoader();

let model; // Define model variable to use it in animation

// Configuration Variables
const CONFIG = {
    version: '1.0.0',
    model: {
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        rotation: {
            x: 0.01,
            y: 0.01,
            z: 0
        },
        scale: {
            x: 2,
            y: 2,
            z: 2
        },
    },
    camera: {
        position: {
            x: 0,
            y: 0,
            z: 10
        }
    }
};

// Simple color variable at the top
const modelColor = 0xff0000; // Red color (change this hex value as needed)

// Control variables
let controls = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    color: 0xff0000,
    scale: 1
};

// Setup control listeners
function setupControls() {
    const controlsDiv = document.querySelector('.controls');
    if (!controlsDiv) {
        const div = document.createElement('div');
        div.className = 'controls';
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            padding: 20px;
            color: white;
            z-index: 100;
            pointer-events: auto;
        `;
        document.body.appendChild(div);
    }
    // Position controls
    document.getElementById('posX').addEventListener('input', (e) => {
        controls.position.x = parseFloat(e.target.value);
        if (model) model.position.x = controls.position.x;
    });
    document.getElementById('posY').addEventListener('input', (e) => {
        controls.position.y = parseFloat(e.target.value);
        if (model) model.position.y = controls.position.y;
    });
    document.getElementById('posZ').addEventListener('input', (e) => {
        controls.position.z = parseFloat(e.target.value);
        if (model) model.position.z = controls.position.z;
    });

    // Rotation controls
    document.getElementById('rotX').addEventListener('input', (e) => {
        controls.rotation.x = parseFloat(e.target.value);
        if (model) model.rotation.x = controls.rotation.x;
    });
    document.getElementById('rotY').addEventListener('input', (e) => {
        controls.rotation.y = parseFloat(e.target.value);
        if (model) model.rotation.y = controls.rotation.y;
    });
    document.getElementById('rotZ').addEventListener('input', (e) => {
        controls.rotation.z = parseFloat(e.target.value);
        if (model) model.rotation.z = controls.rotation.z;
    });

    // Add scale slider HTML
    const scaleDiv = document.createElement('div');
    scaleDiv.innerHTML = `
        <h3>Scale</h3>
        <label>Size: <input type="range" id="modelScale" min="0.1" max="5" step="0.1" value="1"></label>
    `;
    document.querySelector('.controls').appendChild(scaleDiv);

    // Add scale slider listener
    document.getElementById('modelScale').addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value);
        if (model) {
            model.scale.set(scale, scale, scale);
        }
    });

    // Color control
    document.getElementById('modelColor').addEventListener('input', (e) => {
        controls.color = e.target.value;
        if (model) {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.setStyle(controls.color);
                    child.material.emissive.setStyle(controls.color);
                }
            });
        }
    });
}

// Call setup after DOM is loaded
document.addEventListener('DOMContentLoaded', setupControls);

// Add transform controls variable
let transformControls;

// After scene setup, add this function
function setupTransformControls() {
    transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls);

    transformControls.addEventListener('change', () => {
        if (model) {
            // Update position sliders
            document.getElementById('posX').value = model.position.x;
            document.getElementById('posY').value = model.position.y;
            document.getElementById('posZ').value = model.position.z;

            // Update rotation sliders
            document.getElementById('rotX').value = model.rotation.x;
            document.getElementById('rotY').value = model.rotation.y;
            document.getElementById('rotZ').value = model.rotation.z;
        }
        renderer.render(scene, camera);
    });

    // Add mode buttons to controls
    const transformDiv = document.createElement('div');
    transformDiv.innerHTML = `
        <h3>Transform Mode</h3>
        <button id="translateBtn">Translate</button>
        <button id="rotateBtn">Rotate</button>
        <button id="scaleBtn">Scale</button>
    `;
    document.querySelector('.controls').appendChild(transformDiv);

    // Add button event listeners
    document.getElementById('translateBtn').addEventListener('click', () => {
        transformControls.setMode('translate');
    });
    document.getElementById('rotateBtn').addEventListener('click', () => {
        transformControls.setMode('rotate');
    });
    document.getElementById('scaleBtn').addEventListener('click', () => {
        transformControls.setMode('scale');
    });
}

// Add display element creation
function createValueDisplay() {
    const displayDiv = document.createElement('div');
    displayDiv.id = 'valueDisplay';
    displayDiv.innerHTML = `
        <h3>Model Values</h3>
        <div class="value-group">
            <div class="header-with-reset">
                <h4>Position</h4>
                <button class="reset-btn" id="resetPosition">Reset</button>
            </div>
            <div class="input-group">
                X: <input type="number" id="posX-text" step="0.1" value="0" style="color: black;">
                Y: <input type="number" id="posY-text" step="0.1" value="0" style="color: black;">
                Z: <input type="number" id="posZ-text" step="0.1" value="0" style="color: black;">
            </div>
        </div>
        <div class="value-group">
            <div class="header-with-reset">
                <h4>Rotation</h4>
                <button class="reset-btn" id="resetRotation">Reset</button>
            </div>
            <div class="input-group">
                X: <input type="number" id="rotX-text" step="0.1" value="0" style="color: black;">
                Y: <input type="number" id="rotY-text" step="0.1" value="0" style="color: black;">
                Z: <input type="number" id="rotZ-text" step="0.1" value="0" style="color: black;">
            </div>
        </div>
        <div class="value-group">
            <div class="header-with-reset">
                <h4>Scale</h4>
                <button class="reset-btn" id="resetScale">Reset</button>
            </div>
            <div class="input-group">
                X: <input type="number" id="scaleX-text" step="0.1" value="1" min="0.1" style="color: black;">
                Y: <input type="number" id="scaleY-text" step="0.1" value="1" min="0.1" style="color: black;">
                Z: <input type="number" id="scaleZ-text" step="0.1" value="1" min="0.1" style="color: black;">
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .value-group {
            margin: 10px 0;
            background: rgba(0,0,0,0.3);
            padding: 10px;
            border-radius: 5px;
        }
        .header-with-reset {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        .reset-btn {
            background: #444;
            color: white;
            border: none;
            padding: 3px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        .reset-btn:hover {
            background: #666;
        }
        .input-group {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            margin-top: 5px;
        }
        .input-group input {
            width: 60px;
            background: rgba(255,255,255,0.9);
            border: 1px solid #666;
            padding: 3px;
            border-radius: 3px;
            color: black;
            cursor: text;
            pointer-events: auto;
        }
        .input-group input:focus {
            outline: 2px solid #0066ff;
            background: white;
        }
        h4 {
            margin: 0;
            font-size: 14px;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
    document.querySelector('.controls').appendChild(displayDiv);

    // Add event listeners for all inputs including scale
    ['X', 'Y', 'Z'].forEach(axis => {
        // Position text inputs
        const posInput = document.getElementById(`pos${axis}-text`);
        posInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = parseFloat(e.target.value);
                model.position[axis.toLowerCase()] = value;
                document.getElementById(`pos${axis}`).value = value;
            }
        });

        // Rotation text inputs
        const rotInput = document.getElementById(`rot${axis}-text`);
        rotInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = parseFloat(e.target.value);
                model.rotation[axis.toLowerCase()] = value;
                document.getElementById(`rot${axis}`).value = value;
            }
        });

        // Scale text inputs
        const scaleInput = document.getElementById(`scale${axis}-text`);
        scaleInput.addEventListener('input', (e) => {
            if (model && !isNaN(e.target.value)) {
                const value = Math.max(0.1, parseFloat(e.target.value));
                model.scale[axis.toLowerCase()] = value;
                // Update uniform scale slider if it exists
                if (document.getElementById('modelScale')) {
                    document.getElementById('modelScale').value = value;
                }
            }
        });
    });

    // Update reset handlers
    document.getElementById('resetPosition').addEventListener('click', () => {
        if (model) {
            model.position.set(0, 0, 0);
            updateValueDisplay();
            ['X', 'Y', 'Z'].forEach(axis => {
                document.getElementById(`pos${axis}`).value = 0;
            });
        }
    });

    document.getElementById('resetRotation').addEventListener('click', () => {
        if (model) {
            model.rotation.set(0, 0, 0);
            updateValueDisplay();
            ['X', 'Y', 'Z'].forEach(axis => {
                document.getElementById(`rot${axis}`).value = 0;
            });
        }
    });

    document.getElementById('resetScale').addEventListener('click', () => {
        if (model) {
            model.scale.set(1, 1, 1);
            updateValueDisplay();
            ['X', 'Y', 'Z'].forEach(axis => {
                document.getElementById(`scale${axis}-text`).value = 1;
            });
            if (document.getElementById('modelScale')) {
                document.getElementById('modelScale').value = 1;
            }
        }
    });
}

// Add value update function
function updateValueDisplay() {
    if (model) {
        ['X', 'Y', 'Z'].forEach(axis => {
            // Position
            document.getElementById(`pos${axis}-text`).value = 
                model.position[axis.toLowerCase()].toFixed(2);
            
            // Rotation
            document.getElementById(`rot${axis}-text`).value = 
                model.rotation[axis.toLowerCase()].toFixed(2);
            
            // Scale
            document.getElementById(`scale${axis}-text`).value = 
                model.scale[axis.toLowerCase()].toFixed(2);
        });
    }
}

// Add export button to controls
function addExportButton() {
    const exportDiv = document.createElement('div');
    exportDiv.className = 'value-group';
    exportDiv.innerHTML = `
        <div class="header-with-reset">
            <h4>Export</h4>
            <button class="export-btn" id="exportPDF">Export as PDF</button>
        </div>
    `;
    
    // Add export button styles
    const style = document.createElement('style');
    style.textContent += `
        .export-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        .export-btn:hover {
            background: #45a049;
        }
    `;
    document.head.appendChild(style);
    
    document.querySelector('.controls').appendChild(exportDiv);
    
    // Add click event with console logging
    const exportButton = document.getElementById('exportPDF');
    exportButton.addEventListener('click', function() {
        console.log('Export button clicked');
        try {
            captureAndExport();
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Check console for details.');
        }
    });
}

// Updated capture and export function
function captureAndExport() {
    console.log('Starting export process');
    
    // Ensure jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF not loaded');
        alert('PDF library not loaded. Please refresh the page.');
        return;
    }

    try {
        // Temporarily hide transform controls
        const wasVisible = transformControls.visible;
        transformControls.visible = false;
        
        // Force a render without controls
        renderer.render(scene, camera);
        
        // Get the canvas
        const canvas = renderer.domElement;
        console.log('Canvas captured:', canvas.width, 'x', canvas.height);
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        // Get the image data
        const imgData = canvas.toDataURL('image/png', 1.0);
        console.log('Image data captured');
        
        // Calculate dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Add the image
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Add metadata
        const date = new Date();
        pdf.setFontSize(12);
        pdf.text(`Export Date: ${date.toLocaleString()}`, 10, pdfHeight + 20);
        
        // Save
        console.log('Saving PDF...');
        pdf.save(`3D_Model_${Date.now()}.pdf`);
        console.log('PDF saved');
        
        // Restore transform controls visibility
        transformControls.visible = wasVisible;
        
        // Re-render with controls
        renderer.render(scene, camera);
        
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Check console for details.');
        
        // Make sure to restore transform controls visibility even if export fails
        transformControls.visible = true;
        renderer.render(scene, camera);
    }
}

// Load the 3D model
loader.load(
    'https://cdn.jsdelivr.net/gh/HShaebi11/PLAY-E-2@main/smile.glb',
    function (gltf) {
        model = gltf.scene;
        
        // Apply initial scale
        model.scale.set(controls.scale, controls.scale, controls.scale);
        
        // Apply initial position
        model.position.set(controls.position.x, controls.position.y, controls.position.z);
        
        // Apply initial rotation
        model.rotation.set(controls.rotation.x, controls.rotation.y, controls.rotation.z);

        // Apply material and color
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: controls.color,
                    metalness: 0.3,
                    roughness: 0.4,
                    emissive: controls.color,
                    emissiveIntensity: 0.2
                });
                child.material.needsUpdate = true;
            }
        });
        
        // Attach transform controls to model
        setupTransformControls();
        createValueDisplay();  // Add value display
        addExportButton();  // Add export button
        transformControls.attach(model);
        
        scene.add(model);
        
        // Log successful model loading
        console.log('Model loaded successfully');
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened:', error);
        const errorMessage = document.createElement('div');
        errorMessage.style.position = 'absolute';
        errorMessage.style.top = '50%';
        errorMessage.style.width = '100%';
        errorMessage.style.textAlign = 'center';
        errorMessage.innerHTML = 'Error loading 3D content';
        document.getElementById('three-container').appendChild(errorMessage);
    }
);

// Update camera position
camera.position.set(
    CONFIG.camera.position.x,
    CONFIG.camera.position.y,
    CONFIG.camera.position.z
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateValueDisplay();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Add proper cleanup for Safari
window.addEventListener('beforeunload', function() {
    renderer.dispose();
    if (model) {
        model.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();
                object.material.dispose();
            }
        });
    }
});

// Add some CSS for the transform buttons
const style = document.createElement('style');
style.textContent = `
    .controls button {
        margin: 5px;
        padding: 5px 10px;
        background: #444;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }
    .controls button:hover {
        background: #666;
    }
`;
document.head.appendChild(style);

// Add transform controls change listener
transformControls.addEventListener('change', () => {
    updateValueDisplay();
    renderer.render(scene, camera);
});

// Add event listener for transform controls
transformControls.addEventListener('objectChange', () => {
    updateValueDisplay();
});

// P5.js initialization with interactive grid
let cols = 20;
let rows = 20;
let grid = [];

const p5Container = document.getElementById('p5-container');
const p5Sketch = new p5(function(p) {
    p.setup = function() {
        p5Canvas = p.createCanvas(p5Container.offsetWidth, p5Container.offsetHeight);
        p5Canvas.parent('p5-container');
        
        // Style P5 canvas
        p5Canvas.style('display', 'block');
        p5Canvas.style('position', 'absolute');
        p5Canvas.style('top', '0');
        p5Canvas.style('left', '0');
        p5Canvas.style('z-index', '1');
        
        p.noStroke();

        // Calculate the size of each cell based on container size
        let cellWidth = p.width / cols;
        let cellHeight = p.height / rows;

        // Initialize the grid
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = i * cellWidth + cellWidth / 2;
                let y = j * cellHeight + cellHeight / 2;
                grid.push({ x, y, baseRadius: cellWidth / 3 });
            }
        }
    };

    p.draw = function() {
        p.background(30); // Removed transparency

        // Draw the grid and add mouse interaction
        for (let cell of grid) {
            let d = p.dist(p.mouseX, p.mouseY, cell.x, cell.y);
            let maxDist = p.width / cols;

            // Change size based on proximity to the mouse
            let radius = cell.baseRadius + p.map(p.constrain(d, 0, maxDist), 0, maxDist, 10, 0);

            // Change color based on proximity to the mouse
            let col = p.map(p.constrain(d, 0, maxDist), 0, maxDist, 255, 100);
            p.fill(col, 150, 255 - col); // Removed transparency

            // Draw the circle
            p.ellipse(cell.x, cell.y, radius);
        }
    };

    p.windowResized = function() {
        p.resizeCanvas(p5Container.offsetWidth, p5Container.offsetHeight);
        
        // Recalculate grid on resize
        grid = [];
        let cellWidth = p.width / cols;
        let cellHeight = p.height / rows;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = i * cellWidth + cellWidth / 2;
                let y = j * cellHeight + cellHeight / 2;
                grid.push({ x, y, baseRadius: cellWidth / 3 });
            }
        }
    };
});