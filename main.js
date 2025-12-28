document.addEventListener("DOMContentLoaded", function() {

    /**
     * Carica un file HTML e restituisce una Promise.
     */
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

    /**
     * Funzione principale che avvia tutte le logiche del sito.
     */
    function initializeSite() {
        setupNav();
        setupContactForm();
        updateCopyrightYear();

        // Inizializza AOS dopo che il contenuto è stato caricato
        setTimeout(() => {
            AOS.init({
                once: true,
                duration: 800,
                easing: 'ease-out-cubic',
                offset: 100,
            });
            // Forza un refresh di AOS per ricalcolare le posizioni
            AOS.refresh();
        }, 100);

        setupTextRevealAnimation();
    }

    function setupNav() {
        // Gestione Navbar Principale
        const nav = document.getElementById('main-nav');
        if (nav) {
            const logo = document.getElementById('nav-logo');
            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const menuSpans = menuBtn ? menuBtn.querySelectorAll('span') : [];
            
            const path = window.location.pathname;
            const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/SitoZup/') || path.endsWith('/SitoZup');
            
            let isMenuOpen = false;

            // Funzione per aggiornare lo stato della navbar
            const updateNavState = () => {
                const isScrolled = window.scrollY > 50;
                const showTransparentNav = isHomePage && !isScrolled && !isMenuOpen;

                // Rimuoviamo classi che potrebbero essere rimaste da stati precedenti
                nav.classList.remove('bg-black/30', 'text-white', 'bg-gradient-to-b', 'from-black/40', 'to-transparent');
                
                // Assicuriamoci che il logo sia sempre "normale" (Nero/Giallo)
                if (logo) {
                    logo.classList.remove('invert', 'brightness-0');
                }

                if (showTransparentNav) {
                    // --- STATO INIZIALE HOME ---
                    // Effetto "Frosted Glass" (Vetro Smerigliato)
                    // Aumentato bg-white a 70% per garantire leggibilità del logo sulla foto
                    // Mantenuto backdrop-blur-md per un effetto morbido ma non eccessivo
                    nav.classList.add('bg-white/70', 'backdrop-blur-md', 'shadow-sm', 'text-black');
                    nav.classList.remove('bg-white/95', 'bg-white/40', 'backdrop-blur-lg');
                } else {
                    // --- STATO SCROLLATO / ALTRE PAGINE ---
                    // Sfondo Bianco Quasi Solido
                    nav.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-sm', 'text-black');
                    nav.classList.remove('bg-white/40', 'bg-white/70', 'backdrop-blur-lg');
                }
            };

            // Event Listeners
            window.addEventListener('scroll', updateNavState);
            
            if (menuBtn) {
                menuBtn.addEventListener('click', () => {
                    isMenuOpen = !isMenuOpen;
                    if (mobileMenu) mobileMenu.classList.toggle('translate-x-full', !isMenuOpen);
                    
                    if (menuSpans.length === 3) {
                        const [s1, s2, s3] = menuSpans;
                        s1.classList.toggle('rotate-45', isMenuOpen);
                        s1.classList.toggle('translate-y-2', isMenuOpen);
                        s2.classList.toggle('opacity-0', isMenuOpen);
                        s3.classList.toggle('-rotate-45', isMenuOpen);
                        s3.classList.toggle('-translate-y-2', isMenuOpen);
                    }
                    
                    updateNavState();
                });
            }

            // Inizializzazione immediata
            // Eseguiamo updateNavState subito, ma anche dopo un piccolo ritardo per assicurarci che il DOM sia pronto
            updateNavState();
            setTimeout(updateNavState, 50);
            
            // Gestione link attivi
            const navLinks = document.querySelectorAll('.nav-link');
            const currentPath = path.split('/').pop() || 'index.html';
            navLinks.forEach(link => {
                const linkPath = link.getAttribute('href').split('/').pop();
                if (linkPath === currentPath) {
                    link.classList.add('active');
                }
            });
        }

        // Gestione Navbar Progetto
        const projectNav = document.getElementById('project-nav');
        if (projectNav) {
             const navTitle = document.getElementById('nav-project-title');
             
             // Cerchiamo il titolo del progetto nella pagina (h1)
             const pageTitle = document.querySelector('h1');
             if (navTitle && pageTitle) {
                 navTitle.textContent = pageTitle.textContent;
             }

             // Mostra il titolo nella navbar solo quando si scrolla oltre l'header
             window.addEventListener('scroll', () => {
                 if (window.scrollY > 400) {
                     navTitle.classList.remove('opacity-0');
                 } else {
                     navTitle.classList.add('opacity-0');
                 }
             });
        }
    }

    function setupContactForm() {
        const contactForm = document.getElementById("contact-form");
        if (!contactForm) return;
        // Logica form...
    }
    
    function updateCopyrightYear() {
        const yearSpan = document.getElementById("copyright-year");
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }

    function setupTextRevealAnimation() {
        const textElements = document.querySelectorAll('main h1, main h2, main h3, section h1, section h2, section h3, header h1');
        
        textElements.forEach(el => {
            if (el.offsetParent === null) return;
            const computedStyle = window.getComputedStyle(el);
            el.style.setProperty('--reveal-color', computedStyle.color);
            el.classList.add('reveal-text-init');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const aosDelay = el.getAttribute('data-aos-delay') || 0;
                        const aosDuration = el.getAttribute('data-aos-duration') || 800;
                        const totalDelay = parseInt(aosDelay) + (parseInt(aosDuration) * 0.5); 
                        setTimeout(() => el.classList.add('reveal-text-anim'), totalDelay);
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(el);
        });
    }

    // --- ESECUZIONE ---
    // Determina quale navbar caricare
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
