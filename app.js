// =================================================================
// AWARD-WINNING PORTFOLIO - THREE.JS ADVANCED ANIMATIONS
// =================================================================

console.log('%c🎨 Portfolio Loaded with Three.js ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; font-size: 18px; font-weight: bold; border-radius: 5px;');

// =================================================================
// THREE.JS SCENE SETUP - PREMIUM HERO ANIMATION
// =================================================================
let scene, camera, renderer, particleSystem, galaxyGeometry, galaxyMaterial;
let heroSphere, heroTorus, heroIcosahedron, heroParticles, heroLights = [];
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJS() {
    const canvas = document.getElementById('webgl');
    if (!canvas) {
        console.error('WebGL canvas not found');
        return;
    }

    // Disable Three.js on mobile for better performance
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        canvas.style.display = 'none';
        console.log('Mobile detected: Three.js disabled for performance');
        return;
    }
    
    try {
        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a0a, 0.002);
        
        // Camera
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 50;
        
        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Create particle galaxy
        createParticleGalaxy();
        
        // Create floating geometric shapes
        createFloatingShapes();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x6366f1, 2, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        
        const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 100);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);
        
        // Animation loop
        animate(0);
        
        console.log('✅ Three.js initialized successfully');
    } catch (error) {
        console.error('❌ Three.js initialization failed:', error);
    }
}

// Create particle galaxy system
function createParticleGalaxy() {
    // Optimize particle count based on device performance
    const isMobile = window.innerWidth < 768;
    const parameters = {
        count: isMobile ? 5000 : 10000,
        size: 0.02,
        radius: 50,
        branches: 5,
        spin: 1,
        randomness: 0.5,
        randomnessPower: 3,
        insideColor: '#6366f1',
        outsideColor: '#8b5cf6'
    };
    
    galaxyGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count);
    
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);
    
    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        
        // Position
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        
        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);
        
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
        
        // Scale
        scales[i] = Math.random();
    }
    
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    galaxyGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    
    // Material
    galaxyMaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: true,
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 30 * renderer.getPixelRatio() }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uSize;
            attribute float scale;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                
                // Rotation animation
                float angle = uTime * 0.2;
                float distanceToCenter = length(modelPosition.xz);
                float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
                float rotationAngle = atan(modelPosition.x, modelPosition.z) + angleOffset;
                
                modelPosition.x = cos(rotationAngle) * distanceToCenter;
                modelPosition.z = sin(rotationAngle) * distanceToCenter;
                
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;
                
                gl_Position = projectedPosition;
                gl_PointSize = uSize * scale;
                gl_PointSize *= (1.0 / - viewPosition.z);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                // Circular particle
                float strength = distance(gl_PointCoord, vec2(0.5));
                strength = 1.0 - strength;
                strength = pow(strength, 3.0);
                
                vec3 color = mix(vec3(0.0), vColor, strength);
                gl_FragColor = vec4(color, strength);
            }
        `
    });
    
    particleSystem = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(particleSystem);
}

// Create floating geometric shapes
let floatingShapes = [];
function createFloatingShapes() {
    const isMobile = window.innerWidth < 768;
    
    const geometries = [
        new THREE.TorusGeometry(1, 0.4, 12, 60),
        new THREE.OctahedronGeometry(1),
        new THREE.IcosahedronGeometry(1),
        new THREE.TetrahedronGeometry(1)
    ];
    
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x6366f1,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    
    const shapeCount = isMobile ? 4 : 6;
    for (let i = 0; i < shapeCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geometry, material.clone());
        
        mesh.position.x = (Math.random() - 0.5) * 100;
        mesh.position.y = (Math.random() - 0.5) * 100;
        mesh.position.z = (Math.random() - 0.5) * 50;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.02 + 0.01
        };
        
        scene.add(mesh);
        floatingShapes.push(mesh);
    }
}

// Animation loop
let clock = new THREE.Clock();
let lastTime = 0;
const fpsLimit = 1000 / 60; // 60 FPS cap

function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // FPS limiting for better performance
    if (currentTime - lastTime < fpsLimit) return;
    lastTime = currentTime;
    
    const elapsedTime = clock.getElapsedTime();
    
    // Update galaxy rotation
    if (particleSystem) {
        particleSystem.rotation.y = elapsedTime * 0.05;
        galaxyMaterial.uniforms.uTime.value = elapsedTime;
    }
    
    // Animate floating shapes
    floatingShapes.forEach((shape, index) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        
        shape.position.y += Math.sin(elapsedTime + index) * 0.01;
    });
    
    // Camera movement based on mouse
    camera.position.x += (mouseX * 0.01 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.01 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Mouse move event
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
});

// Window resize
window.addEventListener('resize', () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// =================================================================
// INITIALIZATION - Wait for DOM to be ready
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js immediately
    initThreeJS();
    
    // Initialize animations
    initAnimations();
    
    // Initialize Locomotive Scroll
    initLocomotiveScroll();
    
    // Start loader animation
    initLoader();
});

// =================================================================
// LOADER
// =================================================================
function initLoader() {
    let loaderCounter = 0;
    const loaderNum = document.querySelector('.loader__counter-num');
    const loader = document.querySelector('.loader');

    if (loader && loaderNum) {
        const counterInterval = setInterval(() => {
            loaderCounter += 2;
            if (loaderCounter > 100) loaderCounter = 100;
            loaderNum.textContent = loaderCounter;
            
            if (loaderCounter === 100) {
                clearInterval(counterInterval);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.body.style.overflow = 'visible';
                }, 300);
            }
        }, 10);
    }
}

// =================================================================
// CUSTOM CURSOR
// =================================================================
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

function animateCursor() {
    const delay = 0.15;
    
    cursorX += (mouseX + windowHalfX - cursorX) * delay;
    cursorY += (mouseY + windowHalfY - cursorY) * delay;
    
    followerX += (mouseX + windowHalfX - followerX) * delay * 0.5;
    followerY += (mouseY + windowHalfY - followerY) * delay * 0.5;
    
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Cursor interactions
const hoverElements = document.querySelectorAll('a, button, .btn-magnetic');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        cursorFollower.classList.add('active');
    });
    
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        cursorFollower.classList.remove('active');
    });
});

// =================================================================
// MAGNETIC BUTTONS
// =================================================================
function magnetic(el, strength = 0.4) {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(el, {
            duration: 0.3,
            x: x * strength,
            y: y * strength,
            ease: 'power2.out'
        });
    });
    
    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            duration: 0.6,
            x: 0,
            y: 0,
            ease: 'elastic.out(1, 0.3)'
        });
    });
}

document.querySelectorAll('.btn-magnetic').forEach(btn => magnetic(btn));

// =================================================================
// SMOOTH SCROLL
// =================================================================
let scroll;

function initLocomotiveScroll() {
    setTimeout(() => {
        try {
            const smoothContent = document.querySelector('#smooth-content');
            if (!smoothContent) {
                console.warn('Smooth content element not found');
                return;
            }

            // Disable smooth scroll on mobile for better performance
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // Use native scrolling on mobile
                document.body.style.overflow = 'auto';
                smoothContent.style.transform = 'none';
                console.log('Mobile detected: Using native scroll');
                return;
            }
        
        scroll = new LocomotiveScroll({
            el: smoothContent,
            smooth: true,
            multiplier: 0.8,
            lerp: 0.1,
            class: 'is-reveal',
            smartphone: {
                smooth: false
            },
            tablet: {
                smooth: false
            }
        });

        scroll.on('scroll', ScrollTrigger.update);

        ScrollTrigger.scrollerProxy('#smooth-content', {
            scrollTop(value) {
                return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
            },
            getBoundingClientRect() {
                return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
            },
            pinType: document.querySelector('#smooth-content').style.transform ? 'transform' : 'fixed'
        });

        ScrollTrigger.addEventListener('refresh', () => scroll.update());
        ScrollTrigger.refresh();
        
        console.log('✅ Locomotive Scroll initialized');
    } catch(e) {
        console.warn('⚠️ Using fallback scroll:', e);
    }
    }, 200);
}

// =================================================================
// GSAP ANIMATIONS
// =================================================================
function initAnimations() {
    if (!window.gsap) {
        console.error('GSAP not loaded');
        return;
    }
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero title animation with 3D effect
    const heroLines = document.querySelectorAll('.hero__title .line__inner');
    if (heroLines.length > 0) {
        gsap.from(heroLines, {
            duration: 1.8,
            y: 200,
            rotationX: 90,
            opacity: 0,
            stagger: 0.1,
            ease: 'power4.out',
            delay: 0.2
        });
    }
    
    // Hero content
    const heroLabel = document.querySelector('.hero__label');
    if (heroLabel) {
        gsap.from(heroLabel, {
            duration: 1.2,
            y: 50,
            opacity: 0,
            scale: 0.8,
            ease: 'back.out(1.7)',
            delay: 0.5
        });
    }
    
    const heroText = document.querySelector('.hero__text');
    if (heroText) {
        gsap.from(heroText, {
            duration: 1.5,
            y: 60,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.7
        });
    }
    
    const heroCta = document.querySelector('.hero__cta');
    if (heroCta) {
        gsap.from(heroCta, {
            duration: 1.5,
            y: 60,
            opacity: 0,
            scale: 0.9,
            ease: 'back.out(1.2)',
            delay: 0.8
        });
    }
    
    const stats = document.querySelectorAll('.stat');
    if (stats.length > 0) {
        gsap.from(stats, {
            duration: 1.2,
            y: 80,
            opacity: 0,
            scale: 0.5,
            stagger: 0.15,
            ease: 'back.out(2)',
            delay: 1
        });
    }
    
    // Section titles - Simplified to ensure visibility
    // Removed animations that hide content with opacity: 0
    
    // Projects - Simple scroll reveal without hiding content
    document.querySelectorAll('.project').forEach((project, index) => {
        // Simple parallax effect without initial opacity: 0
        gsap.to(project.querySelector('.project__img-wrapper'), {
            scrollTrigger: {
                trigger: project,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
            },
            y: -50,
            ease: 'none'
        });
    });
    
    // Add hover 3D effect to project cards
    document.querySelectorAll('.project__img-wrapper').forEach(card => {
        let isHovering = false;
        
        card.addEventListener('mouseenter', () => {
            isHovering = true;
            gsap.to(card, {
                duration: 0.4,
                scale: 1.05,
                z: 50,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * 15;
            const rotateY = ((centerX - x) / centerX) * 15;
            
            gsap.to(card, {
                duration: 0.3,
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1000,
                ease: 'power1.out'
            });
            
            // Create light effect following mouse
            const light = card.querySelector('.card-light') || (() => {
                const div = document.createElement('div');
                div.className = 'card-light';
                div.style.cssText = `
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
                    pointer-events: none;
                    mix-blend-mode: screen;
                    transition: opacity 0.3s;
                `;
                card.appendChild(div);
                return div;
            })();
            
            light.style.left = `${x - 150}px`;
            light.style.top = `${y - 150}px`;
            light.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            isHovering = false;
            gsap.to(card, {
                duration: 0.6,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                z: 0,
                ease: 'elastic.out(1, 0.5)'
            });
            
            const light = card.querySelector('.card-light');
            if (light) {
                light.style.opacity = '0';
            }
        });
    });
    
    // About section - Simplified without hiding content
    // Removed animations that set opacity: 0 to ensure content is always visible
    
    // Contact section - Simplified to ensure visibility
    // All contact cards and CTA are now always visible
}

// =================================================================
// NAVIGATION
// =================================================================
const nav = document.querySelector('.nav');
const scrollProgressBar = document.querySelector('.scroll-progress__bar');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Navigation background
    if (scrollY > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.8)';
        nav.style.backdropFilter = 'blur(10px)';
    } else {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
    }
    
    // Scroll progress bar
    if (scrollProgressBar) {
        const winHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollY / winHeight) * 100;
        scrollProgressBar.style.width = `${scrolled}%`;
    }
});

// Smooth scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            if (scroll && scroll.scrollTo) {
                scroll.scrollTo(target);
            } else {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Back to top
document.getElementById('backToTop')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (scroll && scroll.scrollTo) {
        scroll.scrollTo(0);
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// =================================================================
// PARALLAX TEXT ON SCROLL
// =================================================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Multi-layer parallax on hero text
    document.querySelectorAll('.hero__title .line__inner').forEach((el, index) => {
        const speed = 0.5 + (index * 0.1);
        const yOffset = scrolled * speed * 0.1;
        const opacity = 1 - (scrolled / 1000);
        
        el.style.transform = `translateY(${yOffset}px) translateZ(0)`;
        el.style.opacity = Math.max(opacity, 0);
    });
    
    // Scale effect on scroll
    const heroContainer = document.querySelector('.hero__container');
    if (heroContainer) {
        const scale = 1 - (scrolled / 2000);
        heroContainer.style.transform = `scale(${Math.max(scale, 0.95)}) translateZ(0)`;
    }
    
    // Blur effect on background as you scroll
    const heroBg = document.querySelector('.hero__bg');
    if (heroBg && scrolled < 800) {
        const blur = scrolled / 100;
        heroBg.style.filter = `blur(${blur}px)`;
    }
});

// =================================================================
// CONSOLE ART
// =================================================================
console.log(`
%c
████████╗██╗  ██╗██████╗ ███████╗███████╗     ██╗███████╗
╚══██╔══╝██║  ██║██╔══██╗██╔════╝██╔════╝     ██║██╔════╝
   ██║   ███████║██████╔╝█████╗  █████╗       ██║███████╗
   ██║   ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██   ██║╚════██║
   ██║   ██║  ██║██║  ██║███████╗███████╗╚█████╔╝███████║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚════╝ ╚══════╝
                                                           
%c🎮 3D Particle Galaxy System Active
%c🌌 ${window.innerWidth < 768 ? '5,000' : '10,000'}+ Animated Particles
%c✨ Advanced GSAP Animations
%c💫 Interactive 3D Shapes
%c⚡ Performance Optimized
%c
📧 hemantfsu@gmail.com
💼 Available for opportunities
`,
'color: #6366f1; font-weight: bold;',
'color: #10b981; font-size: 14px;',
'color: #8b5cf6; font-size: 14px;',
'color: #ec4899; font-size: 14px;',
'color: #f59e0b; font-size: 14px;',
'color: #06b6d4; font-size: 14px;',
'color: #999; font-size: 12px; margin-top: 10px;'
);

// Performance monitoring
if (window.performance) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`%c⚡ Page loaded in ${(loadTime / 1000).toFixed(2)}s`, 'color: #10b981; font-size: 14px; font-weight: bold;');
        }, 0);
    });
}
