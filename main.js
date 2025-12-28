/* global AOS */
document.addEventListener("DOMContentLoaded", function() {

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
        setupContactForm();
        updateCopyrightYear();
        setTimeout(() => {
            AOS.init({
                once: true,
                duration: 800,
                easing: 'ease-out-cubic',
                offset: 100,
            });
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
            const updateNavState = () => {
                const isScrolled = window.scrollY > 50;
                const showTransparentNav = isHomePage && !isScrolled && !isMenuOpen;
                nav.classList.remove('bg-black/30', 'text-white', 'bg-gradient-to-b', 'from-black/40', 'to-transparent');

                if (logo) {
                    logo.classList.remove('invert', 'brightness-0');
                }

                if (showTransparentNav) {
                    nav.classList.add('bg-white/70', 'backdrop-blur-md', 'shadow-sm', 'text-black');
                    nav.classList.remove('bg-white/95', 'bg-white/40', 'backdrop-blur-lg');
                } else {
                    nav.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-sm', 'text-black');
                    nav.classList.remove('bg-white/40', 'backdrop-blur-lg');
                }
            };

            // Event Listeners
            window.addEventListener('scroll', updateNavState);
            
            if (menuBtn) {
                menuBtn.addEventListener('click', () => {
                    isMenuOpen = !isMenuOpen;
                    
                    // Gestione visibilità menu mobile
                    if (mobileMenu) {
                        // Aggiungi le classi di transizione solo quando si interagisce con il menu
                        mobileMenu.classList.add('transition-transform', 'duration-500', 'ease-in-out');

                        if (isMenuOpen) {
                            // Apri menu
                            mobileMenu.style.display = 'flex'; // Ripristina display flex
                            mobileMenu.classList.remove('hidden'); // Rimuovi classe hidden di Tailwind
                            
                            // Forza un reflow per assicurare che la transizione avvenga
                            void mobileMenu.offsetWidth;
                            
                            mobileMenu.style.visibility = 'visible';
                            mobileMenu.classList.remove('invisible');
                            
                            requestAnimationFrame(() => {
                                mobileMenu.style.transform = 'translateX(0)';
                                mobileMenu.classList.remove('translate-x-full');
                            });
                        } else {
                            mobileMenu.style.transform = 'translateX(100%)';
                            mobileMenu.classList.add('translate-x-full');
                            setTimeout(() => {
                                if (!isMenuOpen) {
                                    mobileMenu.style.visibility = 'hidden';
                                    mobileMenu.classList.add('invisible');
                                    mobileMenu.style.display = 'none'; // Nascondi completamente
                                    mobileMenu.classList.add('hidden'); // Aggiungi classe hidden di Tailwind
                                    // Rimuovi le classi di transizione dopo la chiusura
                                    mobileMenu.classList.remove('transition-transform', 'duration-500', 'ease-in-out');
                                }
                            }, 500); // 500ms corrisponde a duration-500
                        }
                    }
                    
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
        // Logica form...
    }
    
    function updateCopyrightYear() {
        const yearSpan = document.getElementById("copyright-year");
        if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
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
