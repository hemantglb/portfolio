(function() {
    'use strict';

    function initUniqueAbout() {
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;

        aboutSection.className = 'about unique-about';
        aboutSection.innerHTML = '';
        
        const content = createContent();
        aboutSection.appendChild(content);

        setTimeout(() => {
            initInteractions();
            initScrollReveal();
        }, 100);
    }

    function createContent() {
        const container = document.createElement('div');
        container.className = 'unique-container';

        // Floating accent
        const accent = document.createElement('div');
        accent.className = 'floating-accent';
        container.appendChild(accent);

        // Header
        const header = document.createElement('div');
        header.className = 'unique-header';
        header.setAttribute('data-reveal', 'fade-up');

        const name = document.createElement('h2');
        name.className = 'unique-name';
        name.innerHTML = 'Hemant <span class="accent-name">Dhangar</span>';

        const role = document.createElement('p');
        role.className = 'unique-role';
        role.textContent = 'MCA Student & Full-Stack Developer';

        header.appendChild(name);
        header.appendChild(role);

        // Main content - single unified card
        const main = document.createElement('div');
        main.className = 'unique-main';

        const card = createUnifiedCard();
        main.appendChild(card);

        container.appendChild(header);
        container.appendChild(main);

        return container;
    }

    function createUnifiedCard() {
        const card = document.createElement('div');
        card.className = 'unified-card';
        card.setAttribute('data-reveal', 'fade-scale');

        // Profile section
        const profileSection = document.createElement('div');
        profileSection.className = 'profile-section';

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image-wrapper';

        const image = document.createElement('img');
        image.src = 'images/profile.jpeg';
        image.alt = 'Hemant Baghel';
        image.className = 'profile-image';

        const imageGlow = document.createElement('div');
        imageGlow.className = 'image-glow';

        imageWrapper.appendChild(imageGlow);
        imageWrapper.appendChild(image);

        const bio = document.createElement('div');
        bio.className = 'bio-content';

        const bioText = document.createElement('p');
        bioText.className = 'bio-text';
        bioText.textContent = 'MCA Student passionate about building clean, functional web applications. Currently pursuing Master of Computer Applications (2024-2026) and continuously learning new technologies.';

        bio.appendChild(bioText);

        profileSection.appendChild(imageWrapper);
        profileSection.appendChild(bio);

        // Divider
        const divider = document.createElement('div');
        divider.className = 'card-divider';

        // Bottom section - Grid
        const bottomGrid = document.createElement('div');
        bottomGrid.className = 'bottom-grid';

        // Achievements
        const achievementsBox = document.createElement('div');
        achievementsBox.className = 'info-box achievements-box';

        const achTitle = document.createElement('h3');
        achTitle.className = 'box-title';
        achTitle.textContent = 'Achievements';

        const achList = document.createElement('div');
        achList.className = 'achievement-list';

        const achievements = [
            'Smart India Hackathon 2024 Finalist',
            'Fusion Fest 2024 Winner'
        ];

        achievements.forEach((ach, index) => {
            const item = document.createElement('div');
            item.className = 'achievement-item';
            item.style.animationDelay = `${0.1 + index * 0.1}s`;
            item.innerHTML = `<span class="ach-icon">★</span><span class="ach-text">${ach}</span>`;
            achList.appendChild(item);
        });

        achievementsBox.appendChild(achTitle);
        achievementsBox.appendChild(achList);

        // Tech Stack
        const techBox = document.createElement('div');
        techBox.className = 'info-box tech-box';

        const techTitle = document.createElement('h3');
        techTitle.className = 'box-title';
        techTitle.textContent = 'Tech Stack';

        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'skills-container';

        const skills = ['React', 'Node.js', 'JavaScript', 'Python', 'MongoDB', 'Git'];

        skills.forEach((skill, index) => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = skill;
            tag.style.animationDelay = `${0.2 + index * 0.05}s`;
            skillsContainer.appendChild(tag);
        });

        techBox.appendChild(techTitle);
        techBox.appendChild(skillsContainer);

        bottomGrid.appendChild(achievementsBox);
        bottomGrid.appendChild(techBox);

        // Assemble card
        card.appendChild(profileSection);
        card.appendChild(divider);
        card.appendChild(bottomGrid);

        return card;
    }

    function initInteractions() {
        // Parallax effect on mouse move
        const card = document.querySelector('.unified-card');
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 40;
            const rotateY = (centerX - x) / 40;

            card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Move glow
            const glow = card.querySelector('.image-glow');
            if (glow) {
                const glowX = (x / rect.width) * 100;
                const glowY = (y / rect.height) * 100;
                glow.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(99, 102, 241, 0.4), transparent 60%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    }

    function initScrollReveal() {
        const elements = document.querySelectorAll('[data-reveal]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(el => observer.observe(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUniqueAbout);
    } else {
        initUniqueAbout();
    }

})();
