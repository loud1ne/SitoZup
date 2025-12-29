/* global AOS */
document.addEventListener("DOMContentLoaded", function() {

    // --- CORE FUNCTIONS ---
    
    const loadHTML = (elementId, filePath) => {
        return fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`File non trovato: ${filePath}`);
                return response.text();
            })
            .then(data => {
                const element = document.getElementById(elementId);
                if (element) element.innerHTML = data;
            })
            .catch(error => console.error(`Errore nel caricamento di ${filePath}:`, error));
    };

    function initializeSite() {
        setupNav();
        setupParallax();
        setupProjectAnimations();
        updateCopyrightYear();
        
        // Inizializza AOS con parametri ottimizzati
        setTimeout(() => {
            AOS.init({
                once: true,
                duration: 1000,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Ease Out Expo
                offset: 50,
                anchorPlacement: 'top-bottom',
            });
            AOS.refresh();
        }, 100);

        // Avvia animazione testo con un piccolo ritardo per permettere il rendering
        setTimeout(setupTextRevealAnimation, 50);
    }

    // --- UI ENHANCEMENTS ---

    function setupParallax() {
        // Semplice effetto parallax sulle immagini
        const parallaxImages = document.querySelectorAll('.parallax-img');
        
        if (parallaxImages.length > 0) {
            // Funzione di aggiornamento ottimizzata con requestAnimationFrame
            let ticking = false;
            
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const scrollY = window.scrollY;
                        const windowHeight = window.innerHeight;
                        
                        parallaxImages.forEach(img => {
                            const rect = img.getBoundingClientRect();
                            // Calcola offset solo se l'immagine è visibile o sta per esserlo
                            if (rect.top < windowHeight && rect.bottom > 0) {
                                const speed = parseFloat(img.getAttribute('data-speed') || 0.1);
                                const offset = (windowHeight - rect.top) * speed;
                                img.style.transform = `scale(1.1) translateY(${offset}px)`;
                            }
                        });
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        }
    }

    function setupNav() {
        const nav = document.getElementById('main-nav');
        if (nav) {
            const logo = document.getElementById('nav-logo');
            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const menuSpans = menuBtn ? menuBtn.querySelectorAll('span') : [];
            
            const path = window.location.pathname;
            const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/SitoZup/') || path.endsWith('/SitoZup');
            
            let isMenuOpen = false;
            
            const updateNavState = () => {
                const isScrolled = window.scrollY > 50;
                const showTransparentNav = isHomePage && !isScrolled && !isMenuOpen;
                
                // Reset classi base
                nav.className = 'fixed w-full z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-4';

                if (showTransparentNav) {
                    nav.classList.add('bg-transparent', 'text-white');
                    if (logo) logo.classList.add('brightness-0', 'invert'); // Logo bianco su sfondo scuro
                } else {
                    nav.classList.add('bg-white/90', 'backdrop-blur-md', 'shadow-sm', 'text-black');
                    if (logo) logo.classList.remove('brightness-0', 'invert');
                }
            };

            window.addEventListener('scroll', updateNavState);
            
            if (menuBtn) {
                menuBtn.addEventListener('click', () => {
                    isMenuOpen = !isMenuOpen;
                    
                    if (mobileMenu) {
                        if (isMenuOpen) {
                            mobileMenu.classList.remove('hidden', 'translate-x-full');
                            document.body.style.overflow = 'hidden'; // Blocca scroll
                        } else {
                            mobileMenu.classList.add('translate-x-full');
                            setTimeout(() => mobileMenu.classList.add('hidden'), 500);
                            document.body.style.overflow = '';
                        }
                    }
                    
                    // Animazione icona hamburger
                    if (menuSpans.length === 3) {
                        const [s1, s2, s3] = menuSpans;
                        if (isMenuOpen) {
                            s1.classList.add('rotate-45', 'translate-y-2');
                            s2.classList.add('opacity-0');
                            s3.classList.add('-rotate-45', '-translate-y-2');
                            // Forza colore nero quando menu aperto
                            menuBtn.classList.add('text-black');
                            menuBtn.classList.remove('text-white');
                        } else {
                            s1.classList.remove('rotate-45', 'translate-y-2');
                            s2.classList.remove('opacity-0');
                            s3.classList.remove('-rotate-45', '-translate-y-2');
                            // Ripristina colore in base allo stato nav
                            updateNavState();
                        }
                    }
                });
            }

            updateNavState();
            setTimeout(updateNavState, 50);
            
            // Active Link Logic
            const navLinks = document.querySelectorAll('.nav-link');
            const currentPath = path.split('/').pop() || 'index.html';
            navLinks.forEach(link => {
                if (link.getAttribute('href').includes(currentPath)) {
                    link.classList.add('active');
                }
            });
        }
    }

    function setupProjectAnimations() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            if (!card.hasAttribute('data-aos')) {
                card.setAttribute('data-aos', 'fade-up');
            }
            if (!card.hasAttribute('data-aos-delay')) {
                // Staggered delay per griglia
                const delay = 100 + (index % 3) * 150; 
                card.setAttribute('data-aos-delay', delay);
            }
        });
    }

    function setupTextRevealAnimation() {
        const textElements = document.querySelectorAll('.reveal-text');
        
        if (textElements.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-delay') || 0);
                    
                    // Usa requestAnimationFrame per sincronizzare con il refresh rate
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            el.classList.add('reveal-text-anim');
                        }, delay);
                    });
                    
                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        textElements.forEach(el => {
            // Aggiungi classe init immediatamente
            el.classList.add('reveal-text-init');
            observer.observe(el);
        });
    }

    function updateCopyrightYear() {
        const yearSpan = document.getElementById("copyright-year");
        if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
    }

    // --- INIT ---
    const mainNavPlaceholder = document.getElementById("main-nav-placeholder");
    const projectNavPlaceholder = document.getElementById("project-nav-placeholder");
    
    const promises = [
        loadHTML("footer-placeholder", "partials/footer.html")
    ];

    if (mainNavPlaceholder) {
        promises.push(loadHTML("main-nav-placeholder", "partials/nav.html"));
    } else if (projectNavPlaceholder) {
        promises.push(loadHTML("project-nav-placeholder", "partials/nav-project.html"));
    }

    Promise.all(promises).then(initializeSite);
});
