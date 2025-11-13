// =================================================================
// PARTICLE PORTRAIT ASSEMBLY - Premium 3D Effect
// Particles assemble into portrait on scroll
// =================================================================

(function() {
    'use strict';

    let scene, camera, renderer, particles, particlePositions;
    let imageData, originalPositions, targetPositions;
    let scrollProgress = 0;
    let canvasContainer;

    const CONFIG = {
        particleCount: 15000, // Optimized for performance
        particleSize: 2,
        imageWidth: 400,
        imageHeight: 400,
        scatterRadius: 8,
        animationSpeed: 0.1,
        glowIntensity: 1.5
    };

    function initParticlePortrait() {
        console.log('🎨 Initializing Particle Portrait...');

        // Find the first layer visual (Who Am I section)
        const firstLayer = document.querySelector('.about-layer[data-layer="0"]');
        if (!firstLayer) {
            console.error('First layer not found');
            return;
        }

        const visual = firstLayer.querySelector('.layer-visual');
        if (!visual) {
            console.error('Visual container not found');
            return;
        }

        // Clear existing content except profile image
        const profileImg = visual.querySelector('.orb-profile-image');
        if (profileImg) {
            profileImg.style.display = 'none'; // Hide original image
        }

        // Create canvas
        canvasContainer = document.createElement('div');
        canvasContainer.className = 'particle-canvas-container';
        canvasContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;
        visual.appendChild(canvasContainer);

        setupThreeJS();
        loadImageAndCreateParticles();
        setupScrollListener();
        animate();

        console.log('✅ Particle Portrait initialized');
    }

    function setupThreeJS() {
        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(
            75,
            canvasContainer.clientWidth / canvasContainer.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 12;

        // Renderer
        renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 50);
        pointLight2.position.set(-5, -5, 5);
        scene.add(pointLight2);
    }

    function loadImageAndCreateParticles() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = 'images/profile.jpeg';

        img.onload = function() {
            // Create off-screen canvas to read pixel data
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = CONFIG.imageWidth;
            canvas.height = CONFIG.imageHeight;
            
            ctx.drawImage(img, 0, 0, CONFIG.imageWidth, CONFIG.imageHeight);
            imageData = ctx.getImageData(0, 0, CONFIG.imageWidth, CONFIG.imageHeight);

            createParticleSystem();
        };

        img.onerror = function() {
            console.error('Failed to load profile image');
            // Create fallback particle system
            createFallbackParticles();
        };
    }

    function createParticleSystem() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const colors = new Float32Array(CONFIG.particleCount * 3);
        const sizes = new Float32Array(CONFIG.particleCount);

        originalPositions = new Float32Array(CONFIG.particleCount * 3);
        targetPositions = new Float32Array(CONFIG.particleCount * 3);

        const pixels = [];
        
        // Extract bright pixels from image
        for (let y = 0; y < CONFIG.imageHeight; y++) {
            for (let x = 0; x < CONFIG.imageWidth; x++) {
                const index = (y * CONFIG.imageWidth + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const a = imageData.data[index + 3];
                
                // Only use visible pixels
                if (a > 128) {
                    const brightness = (r + g + b) / 3;
                    
                    // Sample based on brightness (brighter = more likely to be sampled)
                    if (Math.random() < brightness / 255 || pixels.length < CONFIG.particleCount * 0.5) {
                        pixels.push({
                            x: (x / CONFIG.imageWidth - 0.5) * 6,
                            y: -(y / CONFIG.imageHeight - 0.5) * 6,
                            z: 0,
                            r: r / 255,
                            g: g / 255,
                            b: b / 255
                        });
                    }
                }
            }
        }

        // Limit to particle count
        const sampledPixels = [];
        const step = Math.max(1, Math.floor(pixels.length / CONFIG.particleCount));
        for (let i = 0; i < pixels.length && sampledPixels.length < CONFIG.particleCount; i += step) {
            sampledPixels.push(pixels[i]);
        }

        // Fill remaining with random pixels if needed
        while (sampledPixels.length < CONFIG.particleCount) {
            sampledPixels.push(pixels[Math.floor(Math.random() * pixels.length)]);
        }

        // Initialize particle positions
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            const pixel = sampledPixels[i] || { x: 0, y: 0, z: 0, r: 1, g: 1, b: 1 };

            // Target position (final image)
            targetPositions[i3] = pixel.x;
            targetPositions[i3 + 1] = pixel.y;
            targetPositions[i3 + 2] = pixel.z;

            // Original scattered position
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = CONFIG.scatterRadius * (0.5 + Math.random() * 0.5);

            originalPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            originalPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            originalPositions[i3 + 2] = radius * Math.cos(phi);

            // Start at scattered position
            positions[i3] = originalPositions[i3];
            positions[i3 + 1] = originalPositions[i3 + 1];
            positions[i3 + 2] = originalPositions[i3 + 2];

            // Colors from image
            colors[i3] = pixel.r;
            colors[i3 + 1] = pixel.g;
            colors[i3 + 2] = pixel.b;

            // Random sizes for depth
            sizes[i] = CONFIG.particleSize * (0.5 + Math.random() * 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader material for glow effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                glowIntensity: { value: CONFIG.glowIntensity }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float glowIntensity;
                varying vec3 vColor;
                
                void main() {
                    // Circular particle shape
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // Glow effect
                    float alpha = 1.0 - (dist * 2.0);
                    alpha = pow(alpha, 2.0);
                    
                    // Add bloom
                    vec3 glow = vColor * glowIntensity;
                    
                    gl_FragColor = vec4(glow, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        particlePositions = positions;
    }

    function createFallbackParticles() {
        // Fallback if image fails to load
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const colors = new Float32Array(CONFIG.particleCount * 3);

        originalPositions = new Float32Array(CONFIG.particleCount * 3);
        targetPositions = new Float32Array(CONFIG.particleCount * 3);

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            
            // Sphere formation
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 3;

            targetPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            targetPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            targetPositions[i3 + 2] = radius * Math.cos(phi);

            const scatterRadius = CONFIG.scatterRadius;
            originalPositions[i3] = (Math.random() - 0.5) * scatterRadius;
            originalPositions[i3 + 1] = (Math.random() - 0.5) * scatterRadius;
            originalPositions[i3 + 2] = (Math.random() - 0.5) * scatterRadius;

            positions[i3] = originalPositions[i3];
            positions[i3 + 1] = originalPositions[i3 + 1];
            positions[i3 + 2] = originalPositions[i3 + 2];

            colors[i3] = 0.4 + Math.random() * 0.2;
            colors[i3 + 1] = 0.4 + Math.random() * 0.2;
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: CONFIG.particleSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        particlePositions = positions;
    }

    function setupScrollListener() {
        const aboutSection = document.querySelector('.about');
        
        window.addEventListener('scroll', () => {
            if (!aboutSection) return;

            const rect = aboutSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate scroll progress for first layer
            if (rect.top <= windowHeight && rect.bottom >= 0) {
                // Progress from 0 to 1 as user scrolls through section
                const sectionHeight = rect.height;
                const scrolled = Math.max(0, windowHeight - rect.top);
                scrollProgress = Math.min(1, scrolled / (windowHeight * 0.8));
            }
        });
    }

    function animate() {
        requestAnimationFrame(animate);

        if (particles && particlePositions && originalPositions && targetPositions) {
            // Smooth easing function (ease-out-cubic)
            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
            const easedProgress = easeOutCubic(scrollProgress);

            // Update particle positions
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const i3 = i * 3;

                // Interpolate between scattered and target positions
                particlePositions[i3] = originalPositions[i3] + 
                    (targetPositions[i3] - originalPositions[i3]) * easedProgress;
                particlePositions[i3 + 1] = originalPositions[i3 + 1] + 
                    (targetPositions[i3 + 1] - originalPositions[i3 + 1]) * easedProgress;
                particlePositions[i3 + 2] = originalPositions[i3 + 2] + 
                    (targetPositions[i3 + 2] - originalPositions[i3 + 2]) * easedProgress;
            }

            particles.geometry.attributes.position.needsUpdate = true;

            // Subtle rotation based on scroll
            particles.rotation.y = easedProgress * Math.PI * 0.2;
            particles.rotation.x = Math.sin(easedProgress * Math.PI) * 0.1;
        }

        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (!canvasContainer || !camera || !renderer) return;

        const width = canvasContainer.clientWidth;
        const height = canvasContainer.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticlePortrait);
    } else {
        // Delay to ensure layered-about.js runs first
        setTimeout(initParticlePortrait, 500);
    }

})();
