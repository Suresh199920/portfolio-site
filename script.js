document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('introOverlay');
    const introName = document.getElementById('introName');
    const heroSection = document.querySelector('.hero');
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // ========== UNLOCK ACCESS (GATED RESUME / PROFILE / DRIVE) ==========
    // Defined first so clicks always work even if a later feature throws.
    let pendingAction = null;
    const unlockModal = document.getElementById('unlockModal');
    const unlockForm = document.getElementById('unlockForm');
    const driveEmbed = document.getElementById('driveEmbed');
    const driveLock = document.getElementById('driveLock');
    const profileLock = document.getElementById('profileLock');

    function isUnlocked() {
        try { return sessionStorage.getItem('skUnlocked') === 'true'; } catch (e) { return false; }
    }

    window.requestAccess = function(action) {
        if (isUnlocked()) {
            grantAccess(action);
            return;
        }
        pendingAction = action;
        if (unlockModal) unlockModal.classList.add('show');
    };

    window.closeUnlock = function() {
        if (unlockModal) unlockModal.classList.remove('show');
        pendingAction = null;
    };

    function grantAccess(action) {
        try { sessionStorage.setItem('skUnlocked', 'true'); } catch (e) {}

        if (action === 'resume') {
            const link = document.createElement('a');
            link.href = 'FMS Engineer.pdf';
            link.download = 'FMS Engineer.pdf';
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (action === 'drive') {
            if (driveLock) driveLock.style.display = 'none';
            if (driveEmbed) driveEmbed.style.display = '';
        } else if (action === 'profile') {
            if (profileLock) profileLock.classList.add('unlocked');
        }
    }

    // ========== THANK YOU MODAL ==========
    function restartThankAnimations(modal) {
        const check = modal.querySelector('.ty-check');
        if (check) {
            const fresh = check.cloneNode(true);
            check.parentNode.replaceChild(fresh, check);
        }
        const burst = document.getElementById('tyBurst');
        if (burst) {
            burst.innerHTML = '';
            const colors = ['#00E5FF', '#22C55E', '#8B5CF6', '#EC4899', '#38BDF8', '#22D3EE', '#FBBF24'];
            for (let i = 0; i < 20; i++) {
                const dot = document.createElement('span');
                dot.className = 'ty-dot';
                const ang = (i / 20) * Math.PI * 2;
                const dist = 75 + Math.random() * 70;
                dot.style.setProperty('--bx', `${Math.cos(ang) * dist}px`);
                dot.style.setProperty('--by', `${Math.sin(ang) * dist}px`);
                dot.style.background = colors[i % colors.length];
                dot.style.animationDelay = `${(Math.random() * 0.25).toFixed(2)}s`;
                burst.appendChild(dot);
            }
        }
    }

    window.showThankYou = function(message) {
        const modal = document.getElementById('thankYouModal');
        if (!modal) return;
        const sub = document.getElementById('tySub');
        if (sub && message) sub.textContent = message;
        restartThankAnimations(modal);
        modal.classList.add('show');
        setTimeout(() => window.closeThankYou(), 5000);
    };

    window.closeThankYou = function() {
        const modal = document.getElementById('thankYouModal');
        if (modal) modal.classList.remove('show');
    };

    if (document.getElementById('thankYouModal')) {
        document.getElementById('thankYouModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) window.closeThankYou();
        });
    }

    // ===== TELEGRAM NOTIFICATIONS (send form leads to your private chat) =====
    // Setup (2 minutes):
    //   1. Open Telegram -> message @BotFather -> /newbot -> copy the bot token.
    //   2. Message @userinfobot -> copy your chat_id (or just message your bot once).
    //   3. Save the two values below, OR run this in the browser console:
    //        localStorage.setItem('skTgToken', '123456:ABC-your-token');
    //        localStorage.setItem('skTgChatId', '123456789');
    const TG_CONFIG = { botToken: '8806879197:AAFXQjKt1n98gRoiCffDo7MYNEPYUIp9hEM', chatId: '8786503752' };

    function tgToken() {
        try { return TG_CONFIG.botToken || localStorage.getItem('skTgToken') || ''; } catch (e) { return ''; }
    }
    function tgChatId() {
        try { return TG_CONFIG.chatId || localStorage.getItem('skTgChatId') || ''; } catch (e) { return ''; }
    }
    function telegramReady() { return !!(tgToken() && tgChatId()); }

    function sendTelegram(messageHtml) {
        if (!telegramReady()) {
            console.log('%cTelegram not configured yet. Set skTgToken + skTgChatId (see instructions in script.js).', 'color:#FBBF24');
            return false;
        }
        const url = `https://api.telegram.org/bot${tgToken()}/sendMessage`;
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: tgChatId(), text: messageHtml, parse_mode: 'HTML' })
        })
        .then(r => r.json())
        .then(d => {
            if (d && d.ok) console.log('%cTelegram notification sent', 'color:#22C55E');
            else console.warn('Telegram send failed:', d);
        })
        .catch(err => console.warn('Telegram error:', err));
        return true;
    }

    // ===== FIREBASE (LIVE LIKES & COMMENTS) =====
    // Setup (5 minutes) — see the walkthrough at the end of this file, or:
    //   1. Go to https://console.firebase.google.com -> Add project (name: "portfolio-live").
    //   2. Add a Web App (</> icon) -> copy the firebaseConfig object into FIREBASE_CONFIG below.
    //   3. Build -> Realtime Database -> Create database (start in locked/test mode).
    //   4. Build -> Authentication -> Sign-in method -> enable Anonymous.
    //   5. Database -> Rules -> paste the rules from the comment block at the end of this file.
    // The page still works without this — likes/comments then fall back to local storage.
    const FIREBASE_CONFIG = {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_PROJECT.firebaseapp.com',
        databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
        projectId: 'YOUR_PROJECT',
        storageBucket: 'YOUR_PROJECT.appspot.com',
        messagingSenderId: 'YOUR_SENDER_ID',
        appId: 'YOUR_APP_ID'
    };

    const FIREBASE_ENABLED = typeof firebase !== 'undefined' &&
        FIREBASE_CONFIG.apiKey &&
        FIREBASE_CONFIG.apiKey.indexOf('YOUR_') !== 0;

    let fbUid = null;
    let fbDb = null;

    function initFirebase() {
        if (!FIREBASE_ENABLED) return;
        try {
            firebase.initializeApp(FIREBASE_CONFIG);
            fbDb = firebase.database();
            firebase.auth().signInAnonymously()
                .then(() => {
                    fbUid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
                    bindFirebaseLikes();
                })
                .catch((err) => {
                    console.warn('Firebase anonymous auth failed:', err);
                    fbUid = null;
                });
        } catch (err) {
            console.warn('Firebase init failed:', err);
        }
    }

    function formatTelegramLead(type, data) {
        const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const lines = [
            `🔔 <b>New ${type}</b>`,
            `👤 Name: <b>${esc(data.name)}</b>`,
            `📧 Email: ${esc(data.email)}`
        ];
        if (data.phone) lines.push(`📱 Phone: ${esc(data.phone)}`);
        if (data.company) lines.push(`🏢 Company: ${esc(data.company)}`);
        if (data.subject) lines.push(`📝 Subject: ${esc(data.subject)}`);
        if (data.message) lines.push(`💬 Message: ${esc(data.message)}`);
        if (data.purpose) lines.push(`🎯 Purpose: ${esc(data.purpose)}`);
        lines.push(`🕒 ${new Date().toLocaleString()}`);
        if (data.page) lines.push(`🔗 ${esc(data.page)}`);
        return lines.join('\n');
    }

    if (unlockForm) {
        unlockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const visitor = {
                name: document.getElementById('vName').value.trim(),
                email: document.getElementById('vEmail').value.trim(),
                phone: document.getElementById('vPhone').value.trim(),
                company: document.getElementById('vCompany').value.trim(),
                purpose: document.getElementById('vPurpose').value,
                visited: new Date().toISOString(),
                page: window.location.href
            };

            // Persist visitor info to localStorage (lead capture)
            try {
                const history = JSON.parse(localStorage.getItem('skVisitors') || '[]');
                history.push(visitor);
                localStorage.setItem('skVisitors', JSON.stringify(history));
            } catch (err) { /* storage unavailable */ }

            console.log('%cVISITOR INFO CAPTURED', 'color:#00E5FF;font-weight:bold', visitor);
            sendTelegram(formatTelegramLead('Profile Unlock Lead', visitor));

            const action = pendingAction || 'resume';
            pendingAction = null;
            if (unlockModal) unlockModal.classList.remove('show');
            grantAccess(action);

            const name = visitor.name.split(' ')[0];
            window.showThankYou(`Welcome, ${name}! Your details have been recorded and I will stay in touch.`);
        });
    }

    // Close unlock modal on outside click
    if (unlockModal) {
        unlockModal.addEventListener('click', (e) => {
            if (e.target === unlockModal) window.closeUnlock();
        });
    }

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
        'Mechanical Engineer',
        'Facility Management Engineer',
        'BMS Engineer',
        'HVAC Engineer',
        'MEP Engineer'
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
            title: 'Healthcare IBMS Operations',
            description: 'End-to-end operation and maintenance of hospital-wide IBMS at Dr. Sulaiman Al Habib Medical Group, integrating HVAC, lighting control, fire alarm, CCTV, access control, and energy monitoring systems. Manage 10,000+ BMS monitoring points and maintain 99.5%+ system uptime for mission-critical building services supporting active hospital operations.',
            image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop&q=80',
            tags: ['IBMS', 'BMS Operations', 'Hospital', 'BACnet', '10,000+ Points']
        },
        'project2': {
            title: 'Government Building MEP Projects',
            description: 'MEP design support, site inspection, and documentation for multiple concurrent government facility projects at the Department of Buildings, Sri Lanka, including HVAC, electrical, plumbing, and fire systems. Prepared AutoCAD drawings, as-built plans, and system schematics for documentation and approval.',
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&q=80',
            tags: ['MEP', 'Design Support', 'Site Inspection', 'AutoCAD', 'Fire Systems']
        },
        'project3': {
            title: 'HVAC Energy Optimization Research',
            description: 'B.Tech Mechanical research project on "Optimization of HVAC Energy Consumption in a Commercial Building using Smart Control Strategies". Applied smart building automation and control logic to reduce HVAC energy use while maintaining occupant comfort.',
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop&q=80',
            tags: ['HVAC', 'Energy Optimization', 'Smart Control', 'Research']
        },
        'project4': {
            title: 'Hospital HVAC Systems',
            description: '24/7 operation and maintenance of hospital HVAC infrastructure including chillers, AHUs, FCUs, cooling towers, VFDs and VAV systems, achieving 99.5%+ system availability for active clinical services.',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
            tags: ['HVAC', 'Chillers', 'AHUs', 'FCUs', 'VFDs', 'Hospital']
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
            const msg = {
                name: name,
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };
            sendTelegram(formatTelegramLead('Contact Message', msg));
            window.showThankYou(`Thank you, ${name}! Your message has been received. I will get back to you soon.`);
            contactForm.reset();
        });
    }

    // ========== AI CHAT ASSISTANT ==========
    const chatPanel = document.getElementById('aiChatPanel');
    const chatBody = document.getElementById('aiChatBody');
    const chatInput = document.getElementById('aiChatInput');
    const chatQuick = document.getElementById('chatQuickReplies');

    // ----- Optional real-AI mode (Google Gemini) -----
    // Enable by storing an API key in the browser (works offline-safe, no key needed by default):
    //   localStorage.setItem('skAiApiKey', 'YOUR_GEMINI_KEY');
    // or by editing the apiKey field below directly.
    const AI_CONFIG = {
        apiKey: '',
        model: 'gemini-2.0-flash',
        systemPrompt: [
            "You are SK AI, the friendly virtual assistant for Eng. Suresh Kumar, a Facility Management Engineer (IBMS/BMS) based in Riyadh, Saudi Arabia.",
            "Key facts: 4+ years of experience; currently IBMS Lead at Dr. Sulaiman Al Habib Medical Group, Sahafah Hospital (Riyadh), managing a team of 5 technicians and 10,000+ BMS monitoring points at 99.5%+ uptime.",
            "Expertise: IBMS/BMS operations, HVAC & mechanical systems (chillers, AHUs, FCUs, cooling towers, VFDs, VAV), BACnet IP/MSTP, Modbus RTU/TCP, KNX, SCADA, energy management, fire alarm, CCTV, access control.",
            "Education: B.Tech Mechanical Engineering (Lincoln University College, Dec 2025 - Present); HND Building Services Engineering Technology (University College of Jaffna); MEP Quantity Surveying and MEP Skills Upgrade (Eclipse Education).",
            "Certifications: BACnet Basics, BACnet Cybersecurity, ETS6 eCampus - KNX, Safety & Health for Engineers, Project Management Webinar. ASHRAE Student/Associate Member and KNX Association Community Member.",
            "Contact: k.sureshkumar199920@gmail.com, +966 57 857 5624.",
            "Resume: available for download via the Resume button on the site (a short form must be filled first).",
            "He is seeking Facility Management Engineer roles in Saudi Arabia, the UAE, and the GCC.",
            "Answer conversationally, be concise and helpful, reply in the same language the user writes in, and never invent facts beyond the above."
        ].join('\n')
    };

    function aiApiKey() {
        try { return AI_CONFIG.apiKey || localStorage.getItem('skAiApiKey') || ''; } catch (e) { return ''; }
    }
    function realAiEnabled() { return !!aiApiKey(); }

    let chatHistory = [];

    window.toggleChat = function(force) {
        const shouldOpen = typeof force === 'boolean' ? force : !chatPanel.classList.contains('open');
        chatPanel.classList.toggle('open', shouldOpen);
        if (shouldOpen) {
            chatInput.focus();
            renderQuickReplies();
        }
    };

    window.resetChat = function() {
        chatHistory = [];
        if (chatBody) chatBody.innerHTML = '';
        appendChatMsg("Conversation cleared. Ask me anything about Eng. Suresh Kumar!", 'bot');
    };

    function appendChatMsg(text, sender) {
        const msg = document.createElement('div');
        msg.className = `ai-msg ai-${sender}`;
        msg.textContent = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
        return msg;
    }

    function showTyping() {
        const msg = document.createElement('div');
        msg.className = 'ai-msg ai-bot ai-typing';
        msg.innerHTML = '<span></span><span></span><span></span>';
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
        return msg;
    }

    // ----- Quick reply chips -----
    const QUICK_QUESTIONS = [
        'Who is Suresh Kumar?',
        'What is his experience?',
        'Technical skills?',
        'Education & certifications?',
        'Show me projects',
        'How can I contact him?',
        'Download resume'
    ];

    function renderQuickReplies() {
        if (!chatQuick) return;
        chatQuick.innerHTML = '';
        QUICK_QUESTIONS.forEach(q => {
            const chip = document.createElement('button');
            chip.className = 'ai-chip';
            chip.textContent = q;
            chip.addEventListener('click', () => {
                chatInput.value = q;
                window.sendChat();
            });
            chatQuick.appendChild(chip);
        });
    }

    // ----- Offline NLP engine (works without an API key) -----
    const FACTS = {
        name: 'Eng. Suresh Kumar (Sureshkumar K)',
        title: 'Facility Management Engineer',
        location: 'Riyadh, Saudi Arabia',
        email: 'k.sureshkumar199920@gmail.com',
        phone: '+966 57 857 5624',
        role: 'IBMS Lead at Dr. Sulaiman Al Habib Medical Group, Sahafah Hospital',
        years: '4+ years',
        team: '5 technicians',
        points: '10,000+ BMS monitoring points',
        uptime: '99.5%+ system availability'
    };

    function normalizeText(s) {
        return s.toLowerCase()
            .replace(/[^\w\s'@+.-]/g, ' ')
            .replace(/\b(i'm|im|i am|i have|i've|dont|don't|doesn't|cant|can't|wont|won't|whats|what's|how's|how is|where's|r u|u)\b/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function levenshtein(a, b) {
        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            }
        }
        return dp[m][n];
    }

    // intent: { name, words: [canonical + synonyms], reply: string | fn(q) }
    const INTENTS = [
        {
            name: 'who', words: ['who is', 'about suresh', 'about him', 'introduce', 'owner', 'master', 'creator', 'built this', 'made this', 'who are you', 'who made'],
            reply: `He is ${FACTS.name}, a ${FACTS.title} based in ${FACTS.location}. He's currently the ${FACTS.role} — one of Saudi Arabia's largest private hospital groups — overseeing 24/7 operation and maintenance of all building systems across a major hospital facility.`
        },
        {
            name: 'experience', words: ['experience', 'career', 'job', 'work history', 'worked', 'employment', 'background', 'professional history', 'what did he do', 'roles', 'positions'],
            reply: `He has ${FACTS.years} of progressive experience in facility management, BMS/MEP operations, and HVAC systems. Highlights: ${FACTS.role} (Jun 2024 - Present), Assistant Electrical Engineer at New Solar (Sep-Nov 2023), MEP Engineering Intern at the Department of Buildings, Sri Lanka (Feb-Jul 2023), and Site Supervisor at BPPE (Mar-Oct 2021).`
        },
        {
            name: 'skills', words: ['skill', 'expertise', 'expert', 'proficient', 'good at', 'knows', 'technologies', 'protocols', 'strengths', 'capabilities', 'competencies'],
            reply: `His expertise spans IBMS/BMS operations, HVAC & mechanical systems (chillers, AHUs, FCUs, cooling towers, VFDs, VAV systems, pumps), BACnet IP/MSTP, Modbus RTU/TCP, KNX, SCADA, energy management & auditing, fire alarm, CCTV, access control, and smart building analytics. He also works with AutoCAD, CMMS, and preventive maintenance planning.`
        },
        {
            name: 'projects', words: ['project', 'portfolio', 'work collection', 'achievements', 'accomplishments', 'case study', 'delivered'],
            reply: `His key projects include: (1) Healthcare IBMS Operations at Dr. Sulaiman Al Habib Medical Group — 10,000+ BMS points at 99.5%+ uptime, (2) Government Building MEP Projects for the Department of Buildings, Sri Lanka, (3) Solar PV Installations with New Solar, and (4) an HVAC Energy Optimization research project on smart control strategies. You can browse the full collection on Google Drive after unlocking it in the Portfolio section.`
        },
        {
            name: 'services', words: ['service', 'offer', 'consult', 'provide', 'what does he do for hire', 'hire him', 'freelance'],
            reply: `He offers Facility Management, BMS/IBMS Operations, Smart Building Automation (BACnet, Modbus, KNX, SCADA), HVAC Systems, Energy Optimization, and Preventive Maintenance services.`
        },
        {
            name: 'education', words: ['education', 'degree', 'study', 'university', 'college', 'qualification', 'academic', 'btech', 'b.tech', 'hnd', 'diploma'],
            reply: `He is pursuing a B.Tech in Mechanical Engineering at Lincoln University College (Dec 2025 - Present). He holds an HND in Building Services Engineering Technology from University College of Jaffna (Mar 2019 - Dec 2023), plus a Certificate in MEP Quantity Surveying and a Skills Upgrade in MEP Engineering from Eclipse Education.`
        },
        {
            name: 'certifications', words: ['certification', 'certificate', 'license', 'training', 'course', 'bacnet', 'knx', 'ets6', 'hse', 'ashrae', 'membership', 'accredited'],
            reply: `Certifications include BACnet Basics, BACnet Cybersecurity, ETS6 eCampus - KNX, Safety & Health for Engineers, and Project Management Webinar. He's also an ASHRAE Student/Associate Member and a KNX Association Community Member.`
        },
        {
            name: 'contact', words: ['contact', 'email', 'phone', 'number', 'reach', 'call', 'mobile', 'whatsapp', 'message', 'connect with him', 'get in touch'],
            reply: `You can reach him at ${FACTS.email} or ${FACTS.phone}. You can also use the contact form at the bottom of the page — he usually replies quickly.`
        },
        {
            name: 'location', words: ['location', 'based', 'address', 'city', 'country', 'riyadh', 'saudi', 'gcc', 'uae', 'relocate', 'where is he', 'where does he live'],
            reply: `He is based in ${FACTS.location}, and he's open to Facility Management Engineer roles across Saudi Arabia, the UAE, and the GCC.`
        },
        {
            name: 'languages', words: ['language', 'speak', 'tamil', 'english', 'hindi', 'sinhala', 'arabic', 'multilingual'],
            reply: `He speaks Tamil (native), English (professional working proficiency), Hindi (conversational), Sinhala (conversational), and basic Arabic.`
        },
        {
            name: 'company', words: ['company', 'employer', 'al habib', 'habib', 'hospital', 'sahafah', 'medical group', 'where does he work'],
            reply: `He works at Dr. Sulaiman Al Habib Medical Group, Sahafah Hospital in Riyadh as ${FACTS.role}, managing ${FACTS.team} and ${FACTS.points} at ${FACTS.uptime}.`
        },
        {
            name: 'availability', words: ['available', 'availability', 'open to', 'looking for', 'seeking', 'job', 'position', 'vacancy', 'opportunity', 'recruiting', 'apply'],
            reply: `He is actively seeking ${FACTS.title} roles in Saudi Arabia, the UAE, and the GCC. If you have an opportunity, use the contact form or email him at ${FACTS.email}.`
        },
        {
            name: 'resume', words: ['resume', 'cv', 'curriculum', 'download', 'pdf', 'document'],
            reply: `You can download his resume by clicking the Resume button in the hero section — a short form is shown first to unlock access.`
        },
        {
            name: 'salary', words: ['salary', 'pay', 'package', 'compensation', 'charge', 'rate', 'price', 'cost', 'fee'],
            reply: `Salary and project rates depend on the role and scope. It's best to contact him directly at ${FACTS.email} to discuss specific terms.`
        }
    ];

    const GREETINGS = [
        'Hello! Great to see you here. Ask me anything about Eng. Suresh Kumar — experience, skills, projects, or how to download the resume.',
        'Hi there! I\'m SK AI, Suresh\'s virtual assistant. What would you like to know about him?'
    ];
    const THANKS = [
        'You\'re welcome! Anything else you\'d like to know?',
        'Glad I could help! Feel free to ask more questions anytime.'
    ];
    const BYES = [
        'Thanks for stopping by! If you have more questions, I\'m here. Goodbye!',
        'See you soon! Don\'t forget you can download his resume from the hero section.'
    ];

    let chatContext = { lastIntent: null };

    function matchTokens(q, words) {
        const norm = normalizeText(q);
        let score = 0;
        words.forEach(word => {
            const w = normalizeText(word);
            if (norm.includes(w)) {
                score += w.length >= 8 ? 2 : 1;
            }
        });
        // fuzzy typo matching — only credit words owned by this intent
        const tokens = norm.split(' ').filter(t => t.length >= 5);
        const owned = new Set(words.map(w => normalizeText(w)));
        tokens.forEach(t => {
            for (const d of owned) {
                if (Math.abs(d.length - t.length) <= 2 && levenshtein(t, d) <= 1) {
                    score += d.length >= 8 ? 2 : 1;
                    break;
                }
            }
        });
        return { score };
    }

    function detectIntent(q) {
        let best = null, bestScore = 0;
        INTENTS.forEach(intent => {
            const { score } = matchTokens(q, intent.words);
            if (score > bestScore) { bestScore = score; best = intent; }
        });
        if (bestScore <= 0) return null;
        return { intent: best, score: bestScore };
    }

    function getOfflineReply(question) {
        const raw = question.toLowerCase().trim();
        const norm = normalizeText(question);

        // Greetings / small talk
        if (/\b(hi|hello|hey|howdy|salam|assalam|namaste|good (morning|afternoon|evening))\b/.test(norm) && !/\b(how are|who|about|skills|experience|project|resume)\b/.test(norm)) {
            return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
        }
        if (/\b(how are you|how r u|how is it going|how do you do|how's it going)\b/.test(norm)) {
            return "I'm running great! Thanks for asking. How can I help you learn more about Eng. Suresh Kumar?";
        }
        if (/\b(thanks|thank you|thx|thankful|appreciate|great help|that helped)\b/.test(norm)) {
            return THANKS[Math.floor(Math.random() * THANKS.length)];
        }
        if (/\b(bye|goodbye|see you|good night|farewell|cya)\b/.test(norm)) {
            return BYES[Math.floor(Math.random() * BYES.length)];
        }
        if (/\b(help|what can you do|what do you do|options|commands|capabilit|how do you work|what should i ask)\b/.test(norm)) {
            return "I can answer questions about Eng. Suresh Kumar — his experience, technical skills, education, certifications, projects, services, contact details, and resume. Try one of the quick questions above, or just ask me naturally!";
        }
        if (/\b(who are you|your name|what are you|about you)\b/.test(norm) && !/\b(suresh|kumar|engineer)\b/.test(norm)) {
            return "I'm SK AI, the virtual assistant of Eng. Suresh Kumar. I help visitors learn about his profile, skills, and projects — and I even have an advanced AI mode when enabled. Ask me anything about him!";
        }

        // Follow-up on previous topic (only when no new topic is detected)
        const followUp = /\b(tell me more|more details|explain|elaborate|about that|and what|how about|what else|continue|go on|anyway)\b/.test(norm);

        // Multi-intent: "skills and projects"
        if (/\band\b|&/.test(norm)) {
            const parts = norm.split(/\band\b|&/);
            const det1 = detectIntent(parts[0]);
            const det2 = detectIntent(parts.slice(1).join(' '));
            if (det1 && det2 && det1.intent !== det2.intent) {
                chatContext.lastIntent = det2.intent.name;
                const r1 = typeof det1.intent.reply === 'function' ? det1.intent.reply(question) : det1.intent.reply;
                const r2 = typeof det2.intent.reply === 'function' ? det2.intent.reply(question) : det2.intent.reply;
                return r1 + ' ' + r2;
            }
        }

        // Single intent
        const det = detectIntent(question);
        if (det) {
            chatContext.lastIntent = det.intent.name;
            const reply = typeof det.intent.reply === 'function' ? det.intent.reply(question) : det.intent.reply;
            // Numeric follow-ups like "how many years", "how much"
            if (/how many|how much|count|number of|amount/.test(norm)) {
                if (/year|exp/.test(norm)) return `He has ${FACTS.years} of professional experience in facility management and BMS/MEP operations.`;
                if (/point|monitor/.test(norm)) return `He manages ${FACTS.points} across HVAC, electrical, plumbing, fire alarm, CCTV, and access control.`;
                if (/technician|team|staff|people/.test(norm)) return `He leads a ${FACTS.team}, handling preventive, corrective, and emergency maintenance across all building systems.`;
            }
            return reply;
        }

        if (followUp && chatContext.lastIntent) {
            const prev = INTENTS.find(i => i.name === chatContext.lastIntent);
            if (prev) return typeof prev.reply === 'function' ? prev.reply(question) : prev.reply;
        }

        // "yes/no" style checks
        if (/^(is|are|does|do|can|did|has|have)\b/.test(raw) && /(riyadh|saudi|based|location)/.test(norm)) {
            return `Yes! He is based in ${FACTS.location}.`;
        }
        if (/^(is|are|does|do|can|did|has|have)\b/.test(raw) && /(experience|experienced|senior)/.test(norm)) {
            return `Yes — he has ${FACTS.years} of progressive experience, currently serving as ${FACTS.role}.`;
        }

        // Fallback with a smart nudge
        return "I'm not 100% sure I understood that. Could you rephrase it? I can help with topics like his experience, skills, projects, education, certifications, services, contact details, or resume download.";
    }

    async function getRealAiReply(text) {
        const key = aiApiKey();
        if (!key) return null;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${key}`;
        chatHistory.push({ role: 'user', parts: [{ text }] });
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: chatHistory,
                    systemInstruction: { parts: [{ text: AI_CONFIG.systemPrompt }] }
                })
            });
            if (!res.ok) throw new Error('API error ' + res.status);
            const data = await res.json();
            const reply = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
            if (!reply) throw new Error('empty reply');
            chatHistory.push({ role: 'model', parts: [{ text: reply }] });
            return reply;
        } catch (err) {
            chatHistory.pop();
            return null; // fall back to offline engine
        }
    }

    window.sendChat = function() {
        const text = chatInput.value.trim();
        if (!text) return;
        appendChatMsg(text, 'user');
        chatInput.value = '';
        const typing = showTyping();
        const delay = Math.min(400 + text.length * 4, 1200);

        setTimeout(async () => {
            let reply = null;
            if (realAiEnabled()) {
                reply = await getRealAiReply(text);
            }
            if (!reply) {
                reply = getOfflineReply(text);
            }
            typing.remove();
            appendChatMsg(reply, 'bot');
        }, delay);
    };

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') window.sendChat();
    });

    renderQuickReplies();

    // ========== AI TERMINAL TYPING ==========
    function initAITerminal() {
        const terminalBody = document.getElementById('aiTerminalBody');
        if (!terminalBody) return;
        const lines = [
            { cmd: 'scanning.building_controls', ok: '[OK]' },
            { cmd: 'initializing.bms_protocols', ok: '[OK]' },
            { cmd: 'calculating.energy_savings', ok: '25%' },
            { cmd: 'engineer.verified', ok: '[OK]' }
        ];
        let lineIndex = 0;

        function typeNextLine() {
            if (lineIndex >= lines.length) return;
            const line = lines[lineIndex];
            const div = document.createElement('div');
            div.className = 'term-line';
            div.innerHTML = `<span class="term-prompt">&gt;</span> <span class="term-cmd"></span><span class="term-ok"></span>`;
            terminalBody.appendChild(div);
            const cmdEl = div.querySelector('.term-cmd');
            const okEl = div.querySelector('.term-ok');
            let ci = 0;

            function typeChar() {
                if (ci < line.cmd.length) {
                    cmdEl.textContent = line.cmd.substring(0, ci + 1);
                    ci++;
                    setTimeout(typeChar, 35);
                } else {
                    okEl.textContent = ' ' + line.ok;
                    lineIndex++;
                    setTimeout(typeNextLine, 400);
                }
            }
            typeChar();
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeNextLine();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(terminalBody);
    }

    // ========== LOCATION (Riyadh, Saudi Arabia) ==========
    function initLiveLocation() {
        const els = document.querySelectorAll('.live-location');
        if (!els.length) return;
        const setLoc = (text, located) => {
            els.forEach(el => {
                el.innerHTML = '';
                const icon = document.createElement('i');
                icon.className = 'fas fa-map-marker-alt';
                const span = document.createElement('span');
                span.textContent = text;
                el.appendChild(icon);
                el.appendChild(span);
                el.classList.toggle('located', located);
            });
        };
        setLoc('Riyadh, Saudi Arabia', true);
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

    // 3D card tilt disabled (removed on request to reduce motion)

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
            const colors = ['#00E5FF', '#8B5CF6', '#EC4899', '#38BDF8', '#22D3EE'];
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

    // ========== CASE STUDIES SLIDER ==========
    function initCaseSlider() {
        const scroll = document.getElementById('caseScroll');
        const leftBtn = document.getElementById('caseScrollLeft');
        const rightBtn = document.getElementById('caseScrollRight');
        const dotsWrap = document.getElementById('caseDots');
        if (!scroll || !leftBtn || !rightBtn || !dotsWrap) return;

        const cards = Array.prototype.slice.call(scroll.querySelectorAll('.case-card'));

        cards.forEach((card, i) => {
            const dot = document.createElement('button');
            dot.className = 'case-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            dot.addEventListener('click', () => {
                scroll.scrollTo({
                    left: card.offsetLeft - scroll.offsetLeft,
                    behavior: 'smooth'
                });
            });
            dotsWrap.appendChild(dot);
        });

        const dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('.case-dot'));
        const stepWidth = () => {
            const first = cards[0];
            return first ? first.getBoundingClientRect().width + 24 : 320;
        };

        leftBtn.addEventListener('click', () => {
            scroll.scrollBy({ left: -stepWidth(), behavior: 'smooth' });
        });
        rightBtn.addEventListener('click', () => {
            scroll.scrollBy({ left: stepWidth(), behavior: 'smooth' });
        });

        function updateUI() {
            const max = scroll.scrollWidth - scroll.clientWidth;
            leftBtn.disabled = scroll.scrollLeft <= 1;
            rightBtn.disabled = scroll.scrollLeft >= max - 1;
            const scrollRect = scroll.getBoundingClientRect();
            let activeIdx = 0;
            cards.forEach((card, i) => {
                if (card.getBoundingClientRect().left - scrollRect.left <= scrollRect.width / 2) {
                    activeIdx = i;
                }
            });
            dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIdx));
        }

        scroll.addEventListener('scroll', updateUI, { passive: true });
        window.addEventListener('resize', updateUI);
        updateUI();

        // Drag to scroll
        let isDown = false;
        let startX = 0;
        let startScroll = 0;
        let moved = false;

        scroll.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isDown = true;
            moved = false;
            startX = e.clientX;
            startScroll = scroll.scrollLeft;
            scroll.classList.add('dragging');
            try { scroll.setPointerCapture(e.pointerId); } catch (err) {}
        });

        scroll.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 5) moved = true;
            scroll.scrollLeft = startScroll - dx;
        });

        function endDrag() {
            if (!isDown) return;
            isDown = false;
            scroll.classList.remove('dragging');
            if (moved) {
                const snapped = Math.round(scroll.scrollLeft / stepWidth()) * stepWidth();
                scroll.scrollTo({ left: snapped, behavior: 'smooth' });
                setTimeout(() => { moved = false; }, 150);
            }
        }

        scroll.addEventListener('pointerup', endDrag);
        scroll.addEventListener('pointercancel', endDrag);

        scroll.addEventListener('click', (e) => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => e.preventDefault());
        });
    }

    // ========== LIVE LIKES, COMMENTS & SHARE ==========
    const caseStore = (() => {
        const KEY = 'skCaseInteractions';
        function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
        function get(id) {
            const all = read();
            if (!all[id]) all[id] = { liked: false, likes: 0, comments: [] };
            return all[id];
        }
        function save(id, value) {
            const all = read();
            all[id] = value;
            localStorage.setItem(KEY, JSON.stringify(all));
        }
        return { get: get, save: save };
    })();

    function setLikeCount(cardId, n) {
        document.querySelectorAll('.case-like[data-card-id="' + cardId + '"] .case-like-count')
            .forEach(el => { el.textContent = n; });
    }

    function setCommentCount(cardId, n) {
        document.querySelectorAll('.case-comment-toggle[data-card-id="' + cardId + '"] .case-comment-count')
            .forEach(el => { el.textContent = n; });
    }

    function setLiked(cardId, liked) {
        document.querySelectorAll('.case-like[data-card-id="' + cardId + '"]')
            .forEach(btn => btn.classList.toggle('liked', liked));
    }

    function showToast(msg) {
        let toast = document.querySelector('.site-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'site-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    function timeAgo(ts) {
        if (!ts) return '';
        const s = Math.floor((Date.now() - ts) / 1000);
        if (s < 60) return 'just now';
        const m = Math.floor(s / 60);
        if (m < 60) return m + 'm ago';
        const h = Math.floor(m / 60);
        if (h < 24) return h + 'h ago';
        const d = Math.floor(h / 24);
        if (d < 7) return d + 'd ago';
        return new Date(ts).toLocaleDateString();
    }

    function getCasePanel(cardId) {
        return document.querySelector('.case-comments[data-comments-for="' + cardId + '"]');
    }

    function renderComments(cardId, rows) {
        const panel = getCasePanel(cardId);
        if (!panel) return;
        const list = panel.querySelector('.case-comments-list');
        list.innerHTML = '';
        if (!rows || !rows.length) {
            const empty = document.createElement('p');
            empty.className = 'case-comments-empty';
            empty.textContent = 'No comments yet — be the first!';
            list.appendChild(empty);
        } else {
            rows.forEach(c => {
                const item = document.createElement('div');
                item.className = 'case-comment-item';
                const head = document.createElement('div');
                head.className = 'case-comment-head';
                const name = document.createElement('span');
                name.className = 'case-comment-name-tag';
                name.textContent = c.name || 'Guest';
                const time = document.createElement('span');
                time.className = 'case-comment-time';
                time.textContent = timeAgo(c.ts);
                head.appendChild(name);
                head.appendChild(time);
                const body = document.createElement('p');
                body.className = 'case-comment-text-tag';
                body.textContent = c.text;
                item.appendChild(head);
                item.appendChild(body);
                list.appendChild(item);
            });
        }
        list.scrollTop = list.scrollHeight;
    }

    function bindFirebaseLikes() {
        if (!fbDb || !fbUid) return;
        const cardIds = ['cs-1', 'cs-2', 'cs-3', 'cs-4'];
        cardIds.forEach(cardId => {
            fbDb.ref('caseLikes/' + cardId + '/' + fbUid).on('value', (snap) => {
                setLiked(cardId, !!snap.val());
            });
            fbDb.ref('caseLikes/' + cardId).on('value', (snap) => {
                const v = snap.val();
                setLikeCount(cardId, v ? Object.keys(v).length : 0);
            });
            fbDb.ref('caseComments/' + cardId).on('value', (snap) => {
                const v = snap.val();
                setCommentCount(cardId, v ? Object.keys(v).length : 0);
            });
            fbDb.ref('caseComments/' + cardId).orderByChild('ts').limitToLast(50).on('value', (snap) => {
                const v = snap.val();
                const rows = v ? Object.keys(v).map(k => v[k]).sort((a, b) => (a.ts || 0) - (b.ts || 0)) : [];
                renderComments(cardId, rows);
            });
        });
    }

    function toggleLike(cardId) {
        if (fbDb && fbUid) {
            const ref = fbDb.ref('caseLikes/' + cardId + '/' + fbUid);
            ref.once('value').then(snap => {
                if (snap.val()) { ref.remove(); } else { ref.set(true); }
            }).catch(() => { localToggleLike(cardId); });
            return;
        }
        localToggleLike(cardId);
    }

    function localToggleLike(cardId) {
        const data = caseStore.get(cardId);
        data.liked = !data.liked;
        data.likes = Math.max(0, data.likes + (data.liked ? 1 : -1));
        caseStore.save(cardId, data);
        setLiked(cardId, data.liked);
        setLikeCount(cardId, data.likes);
    }

    function postComment(cardId) {
        const panel = getCasePanel(cardId);
        if (!panel) return;
        const nameInput = panel.querySelector('.case-comment-name');
        const textInput = panel.querySelector('.case-comment-text');
        const text = textInput.value.trim();
        if (!text) { textInput.focus(); return; }
        const name = (nameInput.value.trim() || 'Guest').substring(0, 30);
        localStorage.setItem('skCaseName', name);
        if (fbDb) {
            fbDb.ref('caseComments/' + cardId).push({
                uid: fbUid || 'anon',
                name: name,
                text: text,
                ts: firebase.database.ServerValue.TIMESTAMP
            });
        } else {
            const data = caseStore.get(cardId);
            data.comments.push({ name: name, text: text, ts: Date.now() });
            caseStore.save(cardId, data);
            setCommentCount(cardId, data.comments.length);
            renderComments(cardId, data.comments);
        }
        textInput.value = '';
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('Link copied to clipboard!'); }
        catch (e) { showToast('Copy failed — here is the link: ' + text); }
        document.body.removeChild(ta);
    }

    function shareCase() {
        const url = location.origin + location.pathname + '#case-studies';
        const title = document.title || 'Case Studies';
        const text = 'Check out these engineering case studies on ' + title;
        if (navigator.share) {
            navigator.share({ title: title, text: text, url: url }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url)
                .then(() => showToast('Link copied to clipboard!'))
                .catch(() => fallbackCopy(url));
        } else {
            fallbackCopy(url);
        }
    }

    function initLiveEngagement() {
        const likeButtons = document.querySelectorAll('.case-like');
        if (!likeButtons.length) return;

        // Like
        likeButtons.forEach(btn => {
            btn.addEventListener('click', () => toggleLike(btn.dataset.cardId));
        });

        // Share
        document.querySelectorAll('.case-share').forEach(btn => {
            btn.addEventListener('click', shareCase);
        });

        // Comment toggle
        document.querySelectorAll('.case-comment-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const panel = getCasePanel(btn.dataset.cardId);
                if (!panel) return;
                const willOpen = panel.hidden;
                panel.hidden = !willOpen;
                if (willOpen) {
                    const nameInput = panel.querySelector('.case-comment-name');
                    const textInput = panel.querySelector('.case-comment-text');
                    const savedName = localStorage.getItem('skCaseName');
                    if (savedName && !nameInput.value) nameInput.value = savedName;
                    textInput.focus();
                }
            });
        });

        // Post comment
        document.querySelectorAll('.case-comment-post').forEach(btn => {
            btn.addEventListener('click', () => postComment(btn.dataset.cardId));
        });
        document.querySelectorAll('.case-comment-text').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const form = input.closest('.case-comment-form');
                    const postBtn = form && form.querySelector('.case-comment-post');
                    if (postBtn) postBtn.click();
                }
            });
        });

        // Local-mode initial render (Firebase listeners override when ready)
        const cardIds = ['cs-1', 'cs-2', 'cs-3', 'cs-4'];
        cardIds.forEach(cardId => {
            const data = caseStore.get(cardId);
            setLiked(cardId, data.liked);
            setLikeCount(cardId, data.likes);
            setCommentCount(cardId, data.comments.length);
            renderComments(cardId, data.comments);
        });

        initFirebase();
    }

    // ========== CERTIFICATE VIEWER MODAL ==========
    const certModal = document.getElementById('certModal');
    const certViewer = document.getElementById('certViewer');
    const certModalTitle = document.getElementById('certModalTitle');
    const certOpenLink = document.getElementById('certOpenLink');

    window.openCertificate = function(linkEl) {
        if (!certModal) return;
        const url = linkEl.getAttribute('href') || '';
        const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
        if (!fileIdMatch) {
            window.open(url, '_blank');
            return;
        }
        const fileId = fileIdMatch[1];
        const title = (linkEl.getAttribute('data-title') || linkEl.textContent || 'Certificate').trim();
        certModalTitle.textContent = title;
        certOpenLink.setAttribute('href', url);
        certViewer.src = 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/preview';
        certModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeCertificate = function() {
        if (!certModal) return;
        certModal.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => { certViewer.src = ''; }, 250);
    };

    function initCertificateViewer() {
        if (!certModal) return;
        const closeBtn = document.getElementById('certClose');
        if (closeBtn) closeBtn.addEventListener('click', closeCertificate);
        certModal.addEventListener('click', (e) => {
            if (e.target === certModal) closeCertificate();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCertificate();
        });
        document.querySelectorAll('[data-cert-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openCertificate(link);
            });
        });
    }

    // Init all 3D effects
    // init3DTilt removed — card tilt disabled on request
    initHero3D();
    init3DParticles();
    initCardGlow();

    // Init new features
    initAITerminal();
    initLiveLocation();
    initCaseSlider();
    initLiveEngagement();
    initCertificateViewer();

    // Restore unlock state on load
    if (isUnlocked()) {
        if (driveLock) driveLock.style.display = 'none';
        if (driveEmbed) driveEmbed.style.display = '';
        if (profileLock) profileLock.classList.add('unlocked');
    }
});

/*
========== FIREBASE SETUP (for real live likes & comments) ==========
The page falls back to local-storage mode until this is done.

1. Create a project:
   https://console.firebase.google.com -> "Add project" (e.g. "portfolio-live").
2. Add a Web App (click the </> icon) -> register app.
   Copy the firebaseConfig object it shows and paste it into FIREBASE_CONFIG at
   the top of this file (replacing the YOUR_... placeholders).
3. Enable Realtime Database:
   Build -> Realtime Database -> Create database -> Start in "locked mode".
4. Enable Anonymous auth:
   Build -> Authentication -> Get started -> Sign-in method -> enable "Anonymous".
5. Set database rules:
   Realtime Database -> Rules -> replace with:
   {
     "rules": {
       "caseLikes": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "caseComments": {
         ".read": true,
         ".write": "auth != null"
       }
     }
   }
   (Everyone gets a unique anonymous UID automatically, so likes/comments are
   stored per visitor and shared in real time across the whole site.)

Done. Reload the page — likes and comments are now synced live for every visitor.
*/
