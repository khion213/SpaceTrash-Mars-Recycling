// Global variables
let scene, camera, renderer, controls;
let modules = [];
let selectedModule = null;
let raycaster, mouse;
let isLoaded = false;

// Scale factor for easy adjustment of overall system size
const SCALE_FACTOR = 0.25;

// Module definitions with realistic dimensions and Mars-appropriate colors
const moduleDefinitions = [
    {
        name: "Sorting & Preprocess",
        type: "box",
        width: 2.8, height: 1.2, depth: 1.2,
        position: { x: -8, y: 0, z: 0 },
        color: 0x9b9b9b,
        description: "Automated waste classification with conveyor belt and optical sensors for material separation"
    },
    {
        name: "Shred & Dry",
        type: "box", 
        width: 3.4, height: 1.6, depth: 1.4,
        position: { x: -4, y: 0, z: 0 },
        color: 0x6b6b6b,
        description: "Mechanical shredding and moisture removal system for uniform feedstock preparation"
    },
    {
        name: "Extruder / Filament",
        type: "box",
        width: 3.0, height: 1.6, depth: 1.4,
        position: { x: 0, y: 0, z: 0 },
        color: 0x8a8a8a,
        description: "Precision extrusion system producing 3D printing filament from recycled materials"
    },
    {
        name: "Pyrolysis Micro-Reactor",
        type: "cylinder",
        diameter: 1.8, height: 2.2,
        position: { x: 4, y: 1.1, z: 0 },
        color: 0x444444,
        description: "Thermal decomposition reactor converting complex plastics into fuel gas, oils, and carbon"
    },
    {
        name: "Composite 3D Printer",
        type: "box",
        width: 3.2, height: 1.8, depth: 1.6,
        position: { x: 0, y: 0, z: 4 },
        color: 0x777777,
        description: "Large-scale 3D printer combining recycled polymers with Mars regolith for structural parts"
    },
    {
        name: "Foam Processor",
        type: "box",
        width: 2.8, height: 1.4, depth: 1.2,
        position: { x: 4, y: 0, z: 4 },
        color: 0x5a5a5a,
        description: "Compression molding system transforming foam waste into insulation panels"
    },
    {
        name: "Control & Telemetry",
        type: "box",
        width: 1.6, height: 1.2, depth: 0.9,
        position: { x: -6, y: 0, z: 3 },
        color: 0x999999,
        description: "Central monitoring console with real-time system telemetry and process control"
    }
];

// Initialize the 3D scene
function init() {
    try {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x2a1810); // Mars-like brownish background

        // Create camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(18, 12, 18);

        // Create WebGL renderer
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: false,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x2a1810);
        document.getElementById('container').appendChild(renderer.domElement);

        // Setup controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.target.set(0, 2, 0);
        controls.minDistance = 8;
        controls.maxDistance = 40;

        // Setup raycasting for mouse interaction
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // Add lighting
        setupLighting();
        
        // Create modules
        createModules();
        
        // Connect modules with pipes
        createConnectingPipes();
        
        // Add ground plane
        createGroundPlane();
        
        // Add Mars atmosphere effect
        createAtmosphereEffect();

        // Setup event listeners
        setupEventListeners();
        
        // Show UI after loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('info').style.display = 'block';
        document.getElementById('controls').style.display = 'block';
        
        isLoaded = true;
        
        console.log('Mars Recycling System 3D model loaded successfully!');
        
    } catch (error) {
        console.error('Error initializing 3D scene:', error);
        document.getElementById('loading').innerHTML = 'Error loading 3D model. Please refresh the page.';
    }
}

// Setup realistic lighting for Mars environment
function setupLighting() {
    // Ambient light for Mars atmosphere
    const ambientLight = new THREE.AmbientLight(0x402010, 0.4);
    scene.add(ambientLight);

    
    const sunLight = new THREE.DirectionalLight(0xffa366, 0.8);
    sunLight.position.set(15, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);

    // Secondary light for fill
    const fillLight = new THREE.DirectionalLight(0x663311, 0.3);
    fillLight.position.set(-10, 8, -8);
    scene.add(fillLight);

    // Point lights for industrial atmosphere
    const pointLight1 = new THREE.PointLight(0xffffff, 0.4, 25);
    pointLight1.position.set(0, 6, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6600, 0.3, 15);
    pointLight2.position.set(-4, 4, 4);
    scene.add(pointLight2);
}

// Create all modules based on definitions
function createModules() {
    moduleDefinitions.forEach((def, index) => {
        let geometry, mesh;

        // Create geometry based on module type
        if (def.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(
                def.diameter / 2 * SCALE_FACTOR,
                def.diameter / 2 * SCALE_FACTOR,
                def.height * SCALE_FACTOR,
                16
            );
        } else {
            // Default to box
            geometry = new THREE.BoxGeometry(
                def.width * SCALE_FACTOR,
                def.height * SCALE_FACTOR,
                def.depth * SCALE_FACTOR
            );
        }

        // Create metallic material with industrial appearance
        const material = new THREE.MeshPhongMaterial({
            color: def.color,
            shininess: 80,
            specular: 0x222222,
            transparent: false
        });

        mesh = new THREE.Mesh(geometry, material);
        
        // Position module
        mesh.position.set(
            def.position.x * SCALE_FACTOR,
            def.position.y * SCALE_FACTOR + (def.height * SCALE_FACTOR / 2),
            def.position.z * SCALE_FACTOR
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Store reference data
        mesh.userData = {
            name: def.name,
            description: def.description,
            originalColor: def.color,
            index: index
        };

        scene.add(mesh);
        modules.push(mesh);

        // Add realistic industrial details
        addModuleDetails(mesh, def);
    });
}

// Add realistic details to modules
function addModuleDetails(module, def) {
    const detailGroup = new THREE.Group();
    
    // Add control panels
    const panelGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.25);
    const panelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 60
    });
    
    for (let i = 0; i < 2; i++) {
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(
            (def.width * SCALE_FACTOR / 2) + 0.04,
            (i - 0.5) * 0.15,
            (i - 0.5) * 0.15
        );
        panel.castShadow = true;
        detailGroup.add(panel);
    }

    // Add connecting ports and pipes
    const portGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8);
    const portMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    const port = new THREE.Mesh(portGeometry, portMaterial);
    port.rotation.z = Math.PI / 2;
    port.position.set((def.width * SCALE_FACTOR / 2) + 0.06, 0, 0);
    port.castShadow = true;
    detailGroup.add(port);

    // Add LED status indicators
    const ledGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const ledMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        emissive: 0x002200
    });
    
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(
        (def.width * SCALE_FACTOR / 2) + 0.02,
        0.2,
        0
    );
    detailGroup.add(led);

    detailGroup.position.copy(module.position);
    detailGroup.position.y -= def.height * SCALE_FACTOR / 2;
    scene.add(detailGroup);
}

// Create connecting pipes between modules
function createConnectingPipes() {
    const pipeGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);
    const pipeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 40
    });

    // Create a more realistic piping network
    const connections = [
        [0, 1], [1, 2], [2, 4], [3, 5], [6, 0], [4, 5]
    ];

    connections.forEach(([startIdx, endIdx]) => {
        if (startIdx < modules.length && endIdx < modules.length) {
            const startModule = modules[startIdx];
            const endModule = modules[endIdx];
            
            const startPos = startModule.position.clone();
            const endPos = endModule.position.clone();
            
            // Create curved pipe path
            const distance = startPos.distanceTo(endPos);
            const pipe = new THREE.Mesh(pipeGeometry.clone(), pipeMaterial);
            
            pipe.position.copy(startPos).lerp(endPos, 0.5);
            pipe.position.y += 0.2; // Elevate pipes slightly
            pipe.lookAt(endPos);
            pipe.rotateX(Math.PI / 2);
            pipe.scale.y = distance * 0.8;
            
            pipe.castShadow = true;
            scene.add(pipe);
        }
    });
}

// Create Mars ground plane
function createGroundPlane() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
    
    // Create Mars-like terrain texture
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        transparent: true,
        opacity: 0.9
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.1;
    scene.add(ground);

    // Add some Mars rocks for atmosphere
    for (let i = 0; i < 15; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.3 + 0.1, 1);
        const rockMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color(0.4 + Math.random() * 0.2, 0.2 + Math.random() * 0.2, 0.1)
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            (Math.random() - 0.5) * 40,
            0,
            (Math.random() - 0.5) * 40
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
}

// Add Mars atmosphere effect
function createAtmosphereEffect() {
    // Create a subtle particle system for Mars dust
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;     // x
        positions[i + 1] = Math.random() * 20;          // y
        positions[i + 2] = (Math.random() - 0.5) * 100; // z
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xcc6633,
        size: 0.1,
        transparent: true,
        opacity: 0.3
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

// Setup all event listeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    
    document.getElementById('resetBtn').addEventListener('click', resetCamera);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
}

// Handle mouse click for module selection
function onMouseClick(event) {
    if (!isLoaded) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(modules);

    // Clear previous selection
    if (selectedModule) {
        selectedModule.material.emissive.setHex(0x000000);
        selectedModule = null;
        document.getElementById('moduleInfo').style.display = 'none';
    }

    if (intersects.length > 0) {
        selectedModule = intersects[0].object;
        // Highlight selected module
        selectedModule.material.emissive.setHex(0x444400);
        
        // Show module information
        showModuleInfo(selectedModule.userData);
        
        // Animate camera to focus on selected module
        focusOnModule(selectedModule);
    }
}

// Handle mouse hover effects
function onMouseMove(event) {
    if (!isLoaded) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(modules);

    // Reset all modules to normal state (except selected)
    modules.forEach(module => {
        if (module !== selectedModule) {
            module.material.emissive.setHex(0x000000);
        }
    });

    // Highlight hovered module
    if (intersects.length > 0 && intersects[0].object !== selectedModule) {
        intersects[0].object.material.emissive.setHex(0x111111);
    }
}

// Show module information
function showModuleInfo(userData) {
    const infoDiv = document.getElementById('moduleInfo');
    infoDiv.innerHTML = `
        <h4 style="color: #ff6832; margin-bottom: 8px; font-size: 16px;">${userData.name}</h4>
        <p style="margin-bottom: 8px; font-size: 13px; line-height: 1.4;">${userData.description}</p>
        <div style="background: rgba(255, 104, 50, 0.1); padding: 8px; border-radius: 4px; border: 1px solid #ff6832;">
            <small style="color: #ff6832; font-weight: bold;">Module ${userData.index + 1} of ${moduleDefinitions.length}</small>
        </div>
    `;
    infoDiv.style.display = 'block';
}

// Focus camera on selected module
function focusOnModule(module) {
    const targetPosition = module.position.clone();
    const offset = new THREE.Vector3(4, 3, 4);
    
    // Smooth camera transition
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPosition = targetPosition.clone().add(offset);
    
    let progress = 0;
    function animateCamera() {
        progress += 0.03;
        if (progress >= 1) {
            progress = 1;
        } else {
            requestAnimationFrame(animateCamera);
        }
        
        camera.position.lerpVectors(startPosition, endPosition, progress);
        controls.target.lerpVectors(startTarget, targetPosition, progress);
        controls.update();
    }
    animateCamera();
}

// Reset camera to default view
function resetCamera() {
    camera.position.set(18, 12, 18);
    controls.target.set(0, 2, 0);
    controls.update();
    
    // Clear selection
    if (selectedModule) {
        selectedModule.material.emissive.setHex(0x000000);
        selectedModule = null;
        document.getElementById('moduleInfo').style.display = 'none';
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (isLoaded) {
        controls.update();
        renderer.render(scene, camera);
        
        // Add some subtle rotation to particles for atmosphere
        if (scene.children.length > 0) {
            const particleSystem = scene.children.find(child => child instanceof THREE.Points);
            if (particleSystem) {
                particleSystem.rotation.y += 0.0005;
            }
        }
    }
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check for WebGL support
    if (WEBGL.isWebGLAvailable()) {
        init();
        animate();
    } else {
        const warning = WEBGL.getWebGLErrorMessage();
        document.getElementById('loading').innerHTML = 'WebGL not supported. ' + warning.textContent;
    }
});

// Simple WebGL detection
const WEBGL = {
    isWebGLAvailable: function () {
        try {
            var canvas = document.createElement('canvas');
            return !! (window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    },
    getWebGLErrorMessage: function () {
        var element = document.createElement('div');
        element.innerHTML = 'Your graphics card does not seem to support WebGL.';
        return element;
    }
};
