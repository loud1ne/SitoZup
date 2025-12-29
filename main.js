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
                // Fix paths for partials loaded in subdirectories BEFORE inserting into DOM to avoid 404s
                if (basePath === '../') {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');

                    const fixPath = (val) => {
                        if (val && !val.startsWith('http') && !val.startsWith('//') && !val.startsWith('#') && !val.startsWith('mailto:') && !val.startsWith('data:') && !val.startsWith('../')) {
                            return '../' + val;
                        }
                        return val;
                    };

                    doc.querySelectorAll('a').forEach(el => el.setAttribute('href', fixPath(el.getAttribute('href'))));
                    doc.querySelectorAll('img').forEach(el => el.setAttribute('src', fixPath(el.getAttribute('src'))));
                    
                    element.innerHTML = doc.body.innerHTML;
                } else {
                    element.innerHTML = data;
                }

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

        // Rimuovi transizioni CSS
        parallaxImages.forEach(img => {
            img.style.transition = 'none';
            // Assicuriamoci che il parent abbia overflow hidden
            if (img.parentElement) {
                img.parentElement.style.overflow = 'hidden';
            }
        });

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const windowHeight = window.innerHeight;

                    parallaxImages.forEach(img => {
                        const container = img.parentElement;
                        const rect = container.getBoundingClientRect();
                        
                        // Calcola solo se il contenitore è visibile (o quasi)
                        if (rect.bottom > 0 && rect.top < windowHeight) {
                            
                            // Altezza del contenitore
                            const h = rect.height;
                            
                            // Percentuale di attraversamento del viewport
                            // 0 = il top del contenitore entra dal basso
                            // 1 = il bottom del contenitore esce dall'alto
                            // Usiamo una formula che centra l'effetto:
                            // Quando il centro del contenitore è al centro dello schermo, offset = 0
                            
                            const containerCenter = rect.top + h / 2;
                            const screenCenter = windowHeight / 2;
                            const distFromCenter = containerCenter - screenCenter;
                            
                            // Fattore di velocità (più basso = più lento/sottile)
                            const speed = parseFloat(img.getAttribute('data-speed') || 0.15);
                            
                            // Calcolo offset grezzo
                            let translateY = distFromCenter * speed;
                            
                            // --- LOGICA ANTI-BORDI NERI ---
                            // L'immagine è scalata (es. 1.2x).
                            // Abbiamo un margine di movimento pari a (imgHeight - containerHeight) / 2
                            // Se scale = 1.2, imgHeight = 1.2 * h.
                            // Margine = (1.2h - h) / 2 = 0.1h.
                            // Quindi translateY non deve superare +/- 0.1h.
                            
                            const scale = 1.2; 
                            // Calcoliamo il limite di traslazione considerando che lo scale amplifica lo spostamento
                            const maxTranslation = ((h * (scale - 1)) / 2) / scale;
                            
                            // Clampiamo il valore per assicurarci che non esca mai dai bordi
                            if (translateY > maxTranslation) translateY = maxTranslation;
                            if (translateY < -maxTranslation) translateY = -maxTranslation;
                            
                            // Applichiamo la trasformazione
                            img.style.transform = `translateY(${translateY}px) scale(${scale})`;
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
        const projectNav = document.getElementById('project-nav');
        
        // Gestione Nav Principale
        if (nav) {
            const logo = document.getElementById('nav-logo');
            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const menuSpans = menuBtn ? menuBtn.querySelectorAll('span') : [];

            const path = window.location.pathname;
            const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/SitoZup/') || path.endsWith('/SitoZup');

            let isMenuOpen = false;

            const updateNavState = () => {
                const isScrolled = window.scrollY > 20;
                const showTransparentNav = isHomePage && !isScrolled && !isMenuOpen;

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
                        mobileMenu.classList.remove('hidden');
                        document.body.style.overflow = 'hidden';
                        void mobileMenu.offsetWidth;
                        mobileMenu.classList.remove('translate-x-full');

                        nav.classList.add('bg-white/95', 'backdrop-blur-md', 'text-black');
                        nav.classList.remove('bg-transparent', 'text-white');
                        if (logo) logo.classList.remove('brightness-0', 'invert');

                    } else {
                        mobileMenu.classList.add('translate-x-full');
                        document.body.style.overflow = '';
                        setTimeout(() => {
                            if(!isMenuOpen) mobileMenu.classList.add('hidden');
                        }, 500);
                        updateNavState();
                    }

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
            
            // Active Link Logic
            const navLinks = document.querySelectorAll('.nav-link');
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
            const currentPath = path.split('/').pop() || 'index.html';
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const cleanHref = href ? href.replace('../', '') : '';
                if (cleanHref === currentPath) link.classList.add('border-b-2', 'border-current');
            });
            
            mobileNavLinks.forEach(link => {
                const href = link.getAttribute('href');
                const cleanHref = href ? href.replace('../', '') : '';
                if (cleanHref === currentPath) link.classList.add('italic', 'font-bold');
            });
        }
        
        // Gestione Nav Progetto (Semplificata per mobile)
        if (projectNav) {
            // Assicuriamoci che sia visibile e sopra tutto
            projectNav.style.zIndex = '50';
        }
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
    
    // Rilevamento robusto della sottocartella
    let basePath = '';
    const pathname = window.location.pathname;
    
    // Check 1: Path contains /progetti/
    if (pathname.indexOf('/progetti/') !== -1) {
        basePath = '../';
    } 
    // Check 2: Script src starts with ../
    else {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].getAttribute('src');
            if (src && src.indexOf('main.js') !== -1 && src.startsWith('../')) {
                basePath = '../';
                break;
            }
        }
    }

    const mainNavPlaceholder = document.getElementById("main-nav-placeholder");
    const projectNavPlaceholder = document.getElementById("project-nav-placeholder");
    const footerPlaceholder = document.getElementById("footer-placeholder");

    const promises = [];

    if (footerPlaceholder) promises.push(loadHTML("footer-placeholder", basePath + "partials/footer.html"));
    if (mainNavPlaceholder) promises.push(loadHTML("main-nav-placeholder", basePath + "partials/nav.html"));
    if (projectNavPlaceholder) promises.push(loadHTML("project-nav-placeholder", basePath + "partials/nav-project.html"));

    Promise.all(promises).then(initializeSite);
});