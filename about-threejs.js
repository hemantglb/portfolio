// Premium Three.js About Section Effects
// Section-specific 3D animations

(function() {
    const layers = [];

    function initThreeJS() {
        console.log('🎨 Initializing Three.js effects...');
        
        document.querySelectorAll('.about-layer').forEach((layer, index) => {
            const visual = layer.querySelector('.layer-visual');
            if (!visual) return;

            visual.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.className = 'threejs-canvas';
            visual.appendChild(canvas);

            const layerScene = setupScene(canvas, index);
            layers.push(layerScene);
        });
    }

    function setupScene(canvas, index) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        let effect;
        switch(index) {
            case 0: effect = createHologram(scene); break;
            case 1: effect = createTechCubes(scene); break;
            case 2: effect = createKnowledgeTree(scene); break;
            case 3: effect = createTrophy(scene); break;
            case 4: effect = createCodeRain(scene); break;
        }

        let mouseX = 0, mouseY = 0;
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width * 2 - 1;
            mouseY = -(e.clientY - rect.top) / rect.height * 2 + 1;
        });

        function animate() {
            requestAnimationFrame(animate);
            effect.update(mouseX, mouseY, Date.now() * 0.001);
            renderer.render(scene, camera);
        }
        animate();

        return { scene, camera, renderer };
    }

    // Layer 0: Holographic Profile Rings
    function createHologram(scene) {
        const group = new THREE.Group();
        const rings = [];
        
        for (let i = 0; i < 8; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(1 + i * 0.3, 0.02, 16, 100),
                new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.65 + i * 0.03, 1, 0.5), transparent: true, opacity: 0.6 })
            );
            ring.rotation.x = Math.PI / 2;
            rings.push(ring);
            group.add(ring);
        }

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3, wireframe: true })
        );
        group.add(sphere);

        scene.add(group);

        return {
            update: (mx, my, t) => {
                rings.forEach((ring, i) => {
                    ring.rotation.z = t * (0.2 + i * 0.1) * (i % 2 === 0 ? 1 : -1);
                });
                sphere.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
                sphere.rotation.y = t * 0.5;
                group.rotation.x = my * 0.5;
                group.rotation.y = mx * 0.5 + t * 0.1;
            }
        };
    }

    // Layer 1: Floating Tech Cubes
    function createTechCubes(scene) {
        const group = new THREE.Group();
        const cubes = [];
        
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                for (let z = 0; z < 5; z++) {
                    const cube = new THREE.Mesh(
                        new THREE.BoxGeometry(0.3, 0.3, 0.3),
                        new THREE.MeshBasicMaterial({
                            color: new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.8, 0.6),
                            transparent: true,
                            opacity: 0.7,
                            wireframe: Math.random() > 0.5
                        })
                    );
                    cube.position.set((x - 2.5) * 0.8, (y - 2.5) * 0.8, (z - 2.5) * 0.8);
                    cube.userData = { originalY: cube.position.y, offset: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 };
                    cubes.push(cube);
                    group.add(cube);
                }
            }
        }

        scene.add(group);

        return {
            update: (mx, my, t) => {
                cubes.forEach(cube => {
                    cube.position.y = cube.userData.originalY + Math.sin(t * cube.userData.speed + cube.userData.offset) * 0.3;
                    cube.rotation.x += 0.01;
                    cube.rotation.y += 0.01;
                    cube.material.opacity = 0.5 + Math.sin(t + cube.userData.offset) * 0.3;
                });
                group.rotation.x = my * 0.3 + t * 0.1;
                group.rotation.y = mx * 0.3 + t * 0.15;
            }
        };
    }

    // Layer 2: Growing Knowledge Tree
    function createKnowledgeTree(scene) {
        const group = new THREE.Group();
        
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 2, 8),
            new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 })
        );
        trunk.position.y = -1;
        group.add(trunk);

        // Branches
        for (let i = 0; i < 12; i++) {
            const branch = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.08, 0.8, 6),
                new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.7 - i * 0.05, 0.8, 0.5), transparent: true, opacity: 0.7 })
            );
            const angle = (i / 12) * Math.PI * 2;
            branch.position.set(Math.cos(angle) * 0.5, i * 0.2 - 1, Math.sin(angle) * 0.5);
            branch.rotation.z = angle;
            group.add(branch);

            // Leaves
            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
            );
            leaf.position.set(Math.cos(angle) * 1.2, i * 0.2 - 0.5, Math.sin(angle) * 1.2);
            group.add(leaf);
        }

        scene.add(group);

        return {
            update: (mx, my, t) => {
                group.rotation.y = t * 0.2 + mx * 0.3;
                group.position.y = Math.sin(t * 0.5) * 0.2;
            }
        };
    }

    // Layer 3: Golden Trophy
    function createTrophy(scene) {
        const group = new THREE.Group();
        
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32),
            new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.6, wireframe: true })
        );
        base.position.y = -1.5;
        group.add(base);

        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 0.8, 16),
            new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.7 })
        );
        stem.position.y = -1;
        group.add(stem);

        // Trophy cup particles
        const positions = new Float32Array(1000 * 3);
        const colors = new Float32Array(1000 * 3);
        
        for (let i = 0; i < 1000; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 0.5 + Math.random() * 0.3;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = Math.cos(phi) * 0.8;
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.84 + Math.random() * 0.16;
            colors[i * 3 + 2] = 0;
        }
        
        const cupGeo = new THREE.BufferGeometry();
        cupGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        cupGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const cup = new THREE.Points(cupGeo, new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        }));
        group.add(cup);

        scene.add(group);

        return {
            update: (mx, my, t) => {
                cup.rotation.y = t * 0.5;
                group.rotation.y = mx * 0.5;
                group.rotation.x = my * 0.3;
            }
        };
    }

    // Layer 4: Matrix Code Rain
    function createCodeRain(scene) {
        const group = new THREE.Group();
        const streams = [];
        
        for (let i = 0; i < 30; i++) {
            const positions = new Float32Array(50 * 3);
            const colors = new Float32Array(50 * 3);
            
            const x = (Math.random() - 0.5) * 8;
            const z = (Math.random() - 0.5) * 8;
            
            for (let j = 0; j < 50; j++) {
                positions[j * 3] = x;
                positions[j * 3 + 1] = (j / 50) * 8 - 4;
                positions[j * 3 + 2] = z;
                
                const brightness = j / 50;
                colors[j * 3] = 0;
                colors[j * 3 + 1] = 0.5 + brightness * 0.5;
                colors[j * 3 + 2] = 0.3;
            }
            
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const stream = new THREE.Points(geo, new THREE.PointsMaterial({
                size: 0.15,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            }));
            stream.userData = { speed: 0.5 + Math.random() * 1.5 };
            streams.push(stream);
            group.add(stream);
        }

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.2, wireframe: true })
        );
        group.add(sphere);

        scene.add(group);

        return {
            update: (mx, my, t) => {
                streams.forEach(stream => {
                    const positions = stream.geometry.attributes.position.array;
                    for (let i = 1; i < positions.length; i += 3) {
                        positions[i] -= stream.userData.speed * 0.05;
                        if (positions[i] < -4) positions[i] = 4;
                    }
                    stream.geometry.attributes.position.needsUpdate = true;
                });
                
                sphere.rotation.y = t * 0.3;
                sphere.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
                group.rotation.y = mx * 0.2;
            }
        };
    }

    // Handle resize
    window.addEventListener('resize', () => {
        layers.forEach(layer => {
            const canvas = layer.renderer.domElement;
            layer.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            layer.camera.updateProjectionMatrix();
            layer.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });
    });

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThreeJS);
    } else {
        initThreeJS();
    }
})();
