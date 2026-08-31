document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('introOverlay');
    const introName = document.getElementById('introName');
    const heroSection = document.querySelector('.hero');
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // ========== TYPEWRITER (INTRO) ==========
    const introWelcome = document.getElementById('introWelcome');
    const introTitle = document.querySelector('.intro-title');
    const introLoader = document.querySelector('.intro-loader');
    const welcomeText = 'Welcome to My Portfolio';
    const nameText = 'Eng. K SureshKumar';
    let charIndex = 0;

    // Start: show only welcome
    introName.style.display = 'none';
    introTitle.style.display = 'none';
    introLoader.style.display = 'none';

    function typeWriterWelcome() {
        if (charIndex < welcomeText.length) {
            introWelcome.textContent += welcomeText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriterWelcome, 60);
        } else {
            setTimeout(() => {
                introWelcome.style.display = 'none';
                introName.style.display = '';
                introTitle.style.display = '';
                introLoader.style.display = '';
                charIndex = 0;
                typeWriterName();
            }, 30);
        }
    }

    function typeWriterName() {
        if (charIndex < nameText.length) {
            introName.textContent += nameText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriterName, 15);
        }
    }
    setTimeout(typeWriterWelcome, 0);

    // ========== INTRO DISMISS ==========
    function dismissIntro() {
        introOverlay.classList.add('slide-up');
        setTimeout(() => {
            introOverlay.classList.add('hidden');
            heroSection.classList.add('animate-in');
            startTypingRole();
        }, 150);
    }
    setTimeout(dismissIntro, 3200);
    introOverlay.addEventListener('click', dismissIntro);

    // ========== TYPING EFFECT (HERO ROLE) ==========
    const roles = [
        'MEP Engineer',
        'BMS Specialist',
        'HVAC Design Expert',
        'Building Automation Engineer',
        'Mechanical Engineer'
    ];
    const typingEl = document.getElementById('typingText');
    let roleIndex = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function startTypingRole() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingEl.textContent = currentRole.substring(0, charIdx - 1);
            charIdx--;
            typeSpeed = 40;
        } else {
            typingEl.textContent = currentRole.substring(0, charIdx + 1);
            charIdx++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIdx === currentRole.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 400;
        }

        setTimeout(startTypingRole, typeSpeed);
    }

    // ========== NAVBAR SCROLL ==========
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ========== MOBILE MENU ==========
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ========== IMAGE SLIDESHOW ==========
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 1) {
        setInterval(nextSlide, 6000);
    }

    // ========== SCROLL ANIMATIONS (BIDIRECTIONAL) ==========
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.anim-scroll').forEach(el => {
        scrollObserver.observe(el);
    });

    // ========== STAT COUNTER ==========
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        function update() {
            current += step;
            if (current >= target) {
                el.textContent = target;
                return;
            }
            el.textContent = Math.floor(current);
            requestAnimationFrame(update);
        }
        update();
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(el => {
        counterObserver.observe(el);
    });

    // ========== PORTFOLIO FILTERS ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'grid';
                } else {
                    card.style.display = card.getAttribute('data-category') === filter ? 'grid' : 'none';
                }
            });
        });
    });

    // ========== PORTFOLIO MODAL ==========
    const projectsData = {
        'project1': {
            title: 'Commercial Tower BMS',
            description: 'Complete BMS design and implementation for a 40-story commercial tower featuring HVAC controls, lighting automation, and comprehensive energy monitoring. The system includes BACnet integration, IoT sensors, and real-time analytics dashboards. Project delivered within 6 months, providing the client with 35% energy savings and 45% operational efficiency improvements.',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
            tags: ['BMS Design', 'BACnet Integration', 'IoT Sensors', 'Energy Management', 'Commercial']
        },
        'project2': {
            title: 'Hospital HVAC Design',
            description: 'Full MEP engineering for a 200-bed hospital including critical environment HVAC, medical gas systems, and redundant power infrastructure. Designed dedicated clean rooms and isolation rooms with specialized ventilation systems. Implemented comprehensive BMS for patient safety and operational efficiency, meeting all HIPAA and healthcare compliance standards.',
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&q=80',
            tags: ['MEP Design', 'Critical Care', 'HVAC Design', 'Medical Gas', 'Healthcare Compliance']
        },
        'project3': {
            title: 'Industrial BAS Upgrade',
            description: 'Legacy BAS modernization for a manufacturing facility integrating advanced IoT sensors and cloud-based monitoring for predictive maintenance. Implemented digital twin technology for system simulation and optimization. Achieved 30% reduction in downtime and 20% improvement in energy efficiency through smart analytics and automated controls.',
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop&q=80',
            tags: ['BAS Modernization', 'IoT Integration', 'Predictive Maintenance', 'Digital Twin', 'Manufacturing']
        },
        'project4': {
            title: 'Luxury Hotel HVAC System',
            description: 'Energy-efficient HVAC design for a 5-star hotel featuring VRF systems, heat recovery, and guest room automation. Implemented adaptive temperature control based on occupancy patterns. Designed for 40% energy savings compared to conventional systems while maintaining guest comfort standards.',
            image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop&q=80',
            tags: ['HVAC Design', 'VRF Systems', 'Heat Recovery', 'Guest Comfort', 'Energy Efficiency']
        },
        'project5': {
            title: 'Data Center BMS',
            description: 'Specialized BMS for critical IT infrastructure with redundant systems and 24/7 monitoring. Implemented hot aisle/cold aisle containment, raised floor HVAC, and intelligent power distribution. Achieved PUE below 1.3 and 50% improvement in cooling efficiency.',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
            tags: ['Data Center', 'Redundant Systems', 'PUE Optimization', 'Critical Infrastructure', '24/7 Monitoring']
        },
        'project6': {
            title: 'Smart Building Control System',
            description: 'Integrated IoT sensors and AI-based analytics for optimized building operations and user comfort. Developed predictive algorithms for HVAC optimization based on occupancy patterns, weather data, and energy prices. Implemented gamification features to engage building users in energy conservation.',
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop&q=80',
            tags: ['AI Analytics', 'IoT Sensors', 'Predictive Algorithms', 'User Engagement', 'Smart Building']
        }
    };

    window.openModal = function(projectId) {
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('modalTitle');
        const description = document.getElementById('modalDescription');
        const image = document.getElementById('modalImage');
        const tags = document.getElementById('modalTags');

        if (projectsData[projectId]) {
            title.textContent = projectsData[projectId].title;
            description.textContent = projectsData[projectId].description;
            image.src = projectsData[projectId].image;

            tags.innerHTML = '';
            projectsData[projectId].tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'modal-tag';
                tagEl.textContent = tag;
                tags.appendChild(tagEl);
            });

            modal.classList.add('show');
        }
    };

    window.closeModal = function() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('show');
    };

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('projectModal');
        if (e.target === modal) {
            window.closeModal();
        }
    });

    // Add escape key support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeModal();
        }
    });

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            alert(`Thank you, ${name}! Your message has been received. I will get back to you soon.`);
            contactForm.reset();
        });
    }

    // ========== ACTIVE NAV LINK ON SCROLL ==========
    const sections = document.querySelectorAll('.section, .hero');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 200;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ========== 3D CARD TILT EFFECT ==========
    function init3DTilt() {
        const tiltCards = document.querySelectorAll('.tilt-3d');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const maxTilt = 8;
                const rotateX = ((y - centerY) / centerY) * -maxTilt;
                const rotateY = ((x - centerX) / centerX) * maxTilt;
                card.style.transition = 'none';
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
                card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
                card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.4s ease-out';
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
            });
        });
    }

    // ========== 3D HERO PARALLAX ==========
    function initHero3D() {
        const heroContainer = document.querySelector('.hero-container');
        if (!heroContainer) return;
        document.querySelector('.hero').addEventListener('mousemove', (e) => {
            const rect = heroContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const maxRotate = 3;
            const rotateX = ((y - centerY) / centerY) * -maxRotate;
            const rotateY = ((x - centerX) / centerX) * maxRotate;
            heroContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        document.querySelector('.hero').addEventListener('mouseleave', () => {
            heroContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }

    // ========== 3D FLOATING PARTICLES ==========
    function init3DParticles() {
        const container = document.createElement('div');
        container.className = 'particles-3d';
        document.body.prepend(container);
        const count = 40;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-3d';
            const size = Math.random() * 4 + 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 12) + 's';
            const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 ${size * 3}px ${particle.style.background}`;
            container.appendChild(particle);
        }
    }

    // ========== CARD GLOW FOLLOW ==========
    function initCardGlow() {
        document.querySelectorAll('.card-glow').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mx', x + '%');
                card.style.setProperty('--my', y + '%');
            });
        });
    }

    // Init all 3D effects
    init3DTilt();
    initHero3D();
    init3DParticles();
    initCardGlow();
});
