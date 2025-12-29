/* global AOS */
document.addEventListener("DOMContentLoaded", function() {

    // --- CORE FUNCTIONS ---

    const loadHTML = (elementId, filePath) => {
        const element = document.getElementById(elementId);
        if (!element) return Promise.resolve(); // Salta se il placeholder non esiste

        return fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`File non trovato: ${filePath}`);
                return response.text();
            })
            .then(data => {
                element.innerHTML = data;
                // Esegue script all'interno dei partials se necessario
                const scripts = element.querySelectorAll("script");
                scripts.forEach(script => {
                    const newScript = document.createElement("script");
                    newScript.textContent = script.textContent;
                    if(script.src) newScript.src = script.src;
                    document.body.appendChild(newScript);
                });
            })
            .catch(error => console.error(`Errore nel caricamento di ${filePath}:`, error));
    };

    function initializeSite() {
        setupNav();
        setupParallax();
        setupMagneticButtons();
        setupProjectAnimations();
        updateCopyrightYear();

        // Inizializza AOS DOPO che tutto il DOM è pronto
        setTimeout(() => {
            AOS.init({
                once: true,
                duration: 1000,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                offset: 50,
                anchorPlacement: 'top-bottom',
            });
            AOS.refresh();
            setupTextRevealAnimation(); // Avvia testo dopo AOS
        }, 150);
    }

    // --- UI ENHANCEMENTS ---

    function setupMagneticButtons() {
        const btns = document.querySelectorAll('.magnetic-btn');
        btns.forEach(btn => {
            btn.addEventListener('mousemove', function(e) {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    function setupParallax() {
        const parallaxImages = document.querySelectorAll('.parallax-img');
        if (parallaxImages.length === 0) return;

        // Rimuovi transizioni CSS che causano lag/scatti nello scroll
        parallaxImages.forEach(img => {
            img.style.transition = 'none';
            if (img.classList.contains('parallax-top')) {
                img.style.transformOrigin = 'center center';
            }
        });

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const windowHeight = window.innerHeight;

                    parallaxImages.forEach(img => {
                        const container = img.parentElement;
                        const rect = container.getBoundingClientRect();
                        
                        // Calcola solo se visibile
                        if (rect.top < windowHeight && rect.bottom > 0) {
                            const speed = parseFloat(img.getAttribute('data-speed') || 0.1);
                            
                            let offset;
                            let scale = 1.1;

                            // Se l'immagine è marcata come 'parallax-top', usiamo una logica diversa
                            // per evitare spazi vuoti in alto.
                            if (img.classList.contains('parallax-top')) {
                                // Partiamo con l'immagine spostata verso l'alto (negativo)
                                // e la facciamo scendere verso il centro man mano che scrolliamo.
                                // Al termine dello scroll (quando l'header esce), l'offset sarà vicino a 0.
                                // offset = -rect.top * speed - (windowHeight * speed);
                                offset = scrollY * speed;
                                scale = 1.2; // Scale aumentato per coprire lo spostamento iniziale
                            } else {
                                // Centra l'effetto rispetto alla viewport (comportamento standard)
                                offset = (windowHeight - rect.top) * speed - (windowHeight * speed * 0.5);
                            }
                            
                            img.style.transform = `scale(${scale}) translateY(${offset}px)`;
                        }
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function setupNav() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const logo = document.getElementById('nav-logo');
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuSpans = menuBtn ? menuBtn.querySelectorAll('span') : [];

        const path = window.location.pathname;
        const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/SitoZup/') || path.endsWith('/SitoZup');

        let isMenuOpen = false;

        const updateNavState = () => {
            const isScrolled = window.scrollY > 20;
            // Trasparente solo in home, in alto, e se il menu è chiuso
            const showTransparentNav = isHomePage && !isScrolled && !isMenuOpen;

            // Reset base classes ensuring layout (flex) is preserved
            nav.className = `fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-4 flex justify-between items-center`;

            if (showTransparentNav) {
                nav.classList.add('bg-transparent', 'text-white');
                nav.classList.remove('bg-white/95', 'backdrop-blur-md', 'shadow-sm', 'text-black');
                if (logo) logo.classList.add('brightness-0', 'invert');
            } else {
                nav.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-sm', 'text-black');
                nav.classList.remove('bg-transparent', 'text-white');
                if (logo) logo.classList.remove('brightness-0', 'invert');
            }
        };

        window.addEventListener('scroll', updateNavState);

        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                isMenuOpen = !isMenuOpen;

                if (isMenuOpen) {
                    // APERTURA
                    mobileMenu.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                    // Forza reflow per animazione CSS
                    void mobileMenu.offsetWidth;
                    mobileMenu.classList.remove('translate-x-full');

                    // Forza nav style
                    nav.classList.add('bg-white/95', 'backdrop-blur-md', 'text-black');
                    nav.classList.remove('bg-transparent', 'text-white');
                    if (logo) logo.classList.remove('brightness-0', 'invert');

                } else {
                    // CHIUSURA
                    mobileMenu.classList.add('translate-x-full');
                    document.body.style.overflow = '';

                    // Attendi fine transizione per nascondere
                    setTimeout(() => {
                        if(!isMenuOpen) mobileMenu.classList.add('hidden');
                    }, 500);

                    updateNavState();
                }

                // Animazione Hamburger
                const [s1, s2, s3] = menuSpans;
                if (isMenuOpen) {
                    s1.classList.add('rotate-45', 'translate-y-2');
                    s2.classList.add('opacity-0');
                    s3.classList.add('-rotate-45', '-translate-y-2');
                } else {
                    s1.classList.remove('rotate-45', 'translate-y-2');
                    s2.classList.remove('opacity-0');
                    s3.classList.remove('-rotate-45', '-translate-y-2');
                }
            });
        }

        updateNavState();

        // Active Link
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        const currentPath = path.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('border-b-2', 'border-current');
            }
        });
        
        mobileNavLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('italic', 'font-bold');
            }
        });
    }

    function setupProjectAnimations() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            if (!card.hasAttribute('data-aos')) {
                card.setAttribute('data-aos', 'fade-up');
            }
            if (!card.hasAttribute('data-aos-delay')) {
                const delay = 100 + (index % 3) * 150;
                card.setAttribute('data-aos-delay', delay);
            }
        });
    }

    function setupTextRevealAnimation() {
        const textElements = document.querySelectorAll('.reveal-text');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-delay') || 0);

                    setTimeout(() => {
                        el.classList.add('reveal-text-anim');
                    }, delay);

                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        textElements.forEach(el => {
            el.classList.add('reveal-text-init');
            observer.observe(el);
        });
    }

    function updateCopyrightYear() {
        const yearSpan = document.getElementById("copyright-year");
        if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
    }

    // --- INIT ---
    // Caricamento asincrono dei parziali
    const mainNavPlaceholder = document.getElementById("main-nav-placeholder");
    const projectNavPlaceholder = document.getElementById("project-nav-placeholder");
    const footerPlaceholder = document.getElementById("footer-placeholder");

    const promises = [];

    if (footerPlaceholder) promises.push(loadHTML("footer-placeholder", "partials/footer.html"));
    if (mainNavPlaceholder) promises.push(loadHTML("main-nav-placeholder", "partials/nav.html"));
    if (projectNavPlaceholder) promises.push(loadHTML("project-nav-placeholder", "partials/nav-project.html"));

    Promise.all(promises).then(initializeSite);
});