// =================================================================
// SCROLL-LINKED LAYERED ABOUT SECTION
// Premium cinematic reveal with depth and parallax
// =================================================================

(function() {
    'use strict';

    let currentLayer = 0;
    let isScrolling = false;
    let scrollTimeout;

    function initLayeredAbout() {
        console.log('🚀 Initializing Layered About section...');
        const aboutSection = document.querySelector('.about');
        if (!aboutSection) {
            console.error('❌ About section not found!');
            return;
        }
        console.log('✅ About section found:', aboutSection);

        // Create layered structure
        createLayers();
        
        // Setup scroll listener
        setupScrollAnimation();
        
        console.log('✅ Layered About section initialized');
    }

    function createLayers() {
        console.log('🎨 Creating layers...');
        const aboutSection = document.querySelector('.about');
        if (!aboutSection) {
            console.error('❌ About section not found in createLayers');
            return;
        }
        console.log('✅ About section found in createLayers');

        // Create layer wrapper
        const layerWrapper = document.createElement('div');
        layerWrapper.className = 'about-layers';
        layerWrapper.innerHTML = `
            <!-- Layer 1: Introduction -->
            <div class="about-layer about-layer--active" data-layer="0">
                <div class="layer-content">
                    <div class="layer-number">01</div>
                    <h2 class="layer-title">Who Am I?</h2>
                    <p class="layer-text">I'm Hemant Kumar Dhangar, a passionate software developer who transforms complex problems into elegant solutions. With expertise in full-stack development and a proven track record of 200+ LeetCode problems solved.</p>
                    <div class="layer-stats">
                        <div class="mini-stat">
                            <div class="mini-stat-value">200+</div>
                            <div class="mini-stat-label">LeetCode Solved</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-value">15+</div>
                            <div class="mini-stat-label">Projects Built</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-value">3+</div>
                            <div class="mini-stat-label">Years Experience</div>
                        </div>
                    </div>
                </div>
                <div class="layer-visual">
                    <div class="visual-orb">
                        <img src="images/profile.jpeg" alt="Hemant Kumar Dhangar" class="orb-profile-image">
                    </div>
                </div>
            </div>

            <!-- Layer 2: Skills -->
            <div class="about-layer" data-layer="1">
                <div class="layer-content">
                    <div class="layer-number">02</div>
                    <h2 class="layer-title">Tech Arsenal</h2>
                    <p class="layer-text">Proficient in modern web technologies and frameworks, with a focus on building scalable and performant applications.</p>
                    <div class="skill-grid">
                        <div class="skill-card">
                            <div class="skill-icon">⚛️</div>
                            <span>React</span>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">☕</div>
                            <span>Java</span>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">🍃</div>
                            <span>Spring Boot</span>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">💾</div>
                            <span>MySQL</span>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">🎨</div>
                            <span>Tailwind CSS</span>
                        </div>
                        <div class="skill-card">
                            <div class="skill-icon">⚡</div>
                            <span>Three.js</span>
                        </div>
                    </div>
                </div>
                <div class="layer-visual">
                    <div class="visual-grid"></div>
                </div>
            </div>

            <!-- Layer 3: Education -->
            <div class="about-layer" data-layer="2">
                <div class="layer-content">
                    <div class="layer-number">03</div>
                    <h2 class="layer-title">Education</h2>
                    <div class="education-card-large">
                        <div class="edu-badge">🎓</div>
                        <h3>Master's in Computer Applications</h3>
                        <p>GL Bajaj Institute of Technology and Management</p>
                        <div class="edu-timeline">
                            <span>2023 - Present</span>
                        </div>
                    </div>
                </div>
                <div class="layer-visual">
                    <div class="visual-lines"></div>
                </div>
            </div>

            <!-- Layer 4: Achievements -->
            <div class="about-layer" data-layer="3">
                <div class="layer-content">
                    <div class="layer-number">04</div>
                    <h2 class="layer-title">Achievements</h2>
                    <div class="achievements-grid">
                        <div class="achievement-card">
                            <div class="achievement-icon-large">🎯</div>
                            <h4>Smart India Hackathon Finalist</h4>
                            <p>National level hackathon recognition</p>
                        </div>
                        <div class="achievement-card">
                            <div class="achievement-icon-large">🎪</div>
                            <h4>Fusion Fest Lead</h4>
                            <p>Successfully managed college event</p>
                        </div>
                        <div class="achievement-card">
                            <div class="achievement-icon-large">🔥</div>
                            <h4>100 Day Streak</h4>
                            <p>LeetCode daily challenge consistency</p>
                        </div>
                    </div>
                </div>
                <div class="layer-visual">
                    <div class="visual-particles"></div>
                </div>
            </div>

            <!-- Layer 5: Philosophy -->
            <div class="about-layer" data-layer="4">
                <div class="layer-content layer-content--centered">
                    <div class="layer-number">05</div>
                    <div class="quote-large">
                        <div class="quote-mark">"</div>
                        <p>Building the future, one line of code at a time</p>
                        <span class="quote-author">— My Philosophy</span>
                    </div>
                </div>
                <div class="layer-visual">
                    <div class="visual-waves"></div>
                </div>
            </div>

            <!-- Progress Indicator -->
            <div class="layer-progress">
                <div class="progress-dot" data-layer="0"></div>
                <div class="progress-dot" data-layer="1"></div>
                <div class="progress-dot" data-layer="2"></div>
                <div class="progress-dot" data-layer="3"></div>
                <div class="progress-dot" data-layer="4"></div>
            </div>
        `;

        aboutSection.appendChild(layerWrapper);
        console.log('✅ Layer wrapper appended. Total layers:', layerWrapper.querySelectorAll('.about-layer').length);
        
        // Initialize all layers with proper starting state
        initializeLayers();
    }

    function initializeLayers() {
        const layers = document.querySelectorAll('.about-layer');
        
        layers.forEach((layer, index) => {
            // All layers start with default state - Intersection Observer will activate them
            layer.style.opacity = '0';
            layer.style.transform = 'translateY(100px) scale(0.95)';
            layer.style.filter = 'blur(5px)';
        });
        
        console.log('✅ All layers initialized');
    }

    function setupScrollAnimation() {
        const aboutSection = document.querySelector('.about');
        const layers = document.querySelectorAll('.about-layer');
        const progressDots = document.querySelectorAll('.progress-dot');
        
        if (!aboutSection || layers.length === 0) return;

        // Intersection Observer for each layer
        const layerObserverOptions = {
            threshold: [0, 0.3, 0.5, 0.7, 1],
            rootMargin: '-10% 0px -10% 0px'
        };

        const layerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const layer = entry.target;
                const layerIndex = parseInt(layer.getAttribute('data-layer'));
                
                // Layer is in viewport
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    layer.classList.add('about-layer--active');
                    layer.classList.remove('about-layer--exit');
                    
                    // Update current layer index
                    currentLayer = layerIndex;
                    
                    // Update progress dots
                    progressDots.forEach((dot, index) => {
                        if (index === layerIndex) {
                            dot.classList.add('progress-dot--active');
                        } else if (index < layerIndex) {
                            dot.classList.add('progress-dot--passed');
                            dot.classList.remove('progress-dot--active');
                        } else {
                            dot.classList.remove('progress-dot--active', 'progress-dot--passed');
                        }
                    });
                } 
                // Layer is exiting viewport
                else if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
                    if (layer.classList.contains('about-layer--active')) {
                        layer.classList.remove('about-layer--active');
                        layer.classList.add('about-layer--exit');
                    }
                }
            });
        }, layerObserverOptions);

        // Observe each layer
        layers.forEach(layer => {
            layerObserver.observe(layer);
        });

        // Click navigation on progress dots
        progressDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const targetLayer = layers[index];
                targetLayer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLayeredAbout);
    } else {
        initLayeredAbout();
    }

})();
