document.addEventListener("DOMContentLoaded", function() {

    // Caricamento dei file parziali (Header / Footer)
    const loadHTML = (id, file) => {
        const el = document.getElementById(id);
        if (!el) return Promise.resolve();
        return fetch(file)
            .then(res => res.text())
            .then(data => { el.innerHTML = data; })
            .catch(err => console.error('Error loading ' + file, err));
    };

    Promise.all([
        loadHTML("main-nav-placeholder", "partials/nav.html"),
        loadHTML("footer-placeholder", "partials/footer.html")
    ]).then(() => {
        // Piccola attesa per assicurarsi che il DOM sia pronto
        setTimeout(initSite, 50);
    });

    function initSite() {
        // Inizializzazione AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                once: true,
                duration: 1000,
                easing: 'ease-out-cubic',
                offset: 30
            });
        }

        // Animazione testo reveal
        const revealElements = document.querySelectorAll('.reveal-text');
        revealElements.forEach(el => {
            // Aggiungiamo la classe iniziale solo se non è già presente
            if (!el.classList.contains('reveal-text-init')) {
                // el.classList.add('reveal-text-init'); // Gestito via CSS ora
            }
            setTimeout(() => el.classList.add('reveal-text-anim'), el.getAttribute('data-delay') || 0);
        });

        // Gestione Navigazione Glass Effect
        const nav = document.getElementById('main-nav');
        const logo = document.getElementById('nav-logo');
        
        if (nav) {
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    nav.classList.add('glass-nav', 'py-3');
                    nav.classList.remove('py-5', 'bg-transparent', 'text-white');
                    nav.classList.add('text-black');
                    
                    if(logo) {
                        logo.classList.remove('brightness-0', 'invert');
                        // Se siamo in home e lo sfondo era scuro, il logo era bianco. 
                        // Ora diventa nero (default) o viceversa a seconda del logo originale.
                        // Assumiamo logo originale scuro.
                    }
                } else {
                    nav.classList.remove('glass-nav', 'py-3');
                    nav.classList.add('py-5');
                    
                    // Se siamo in home, torna trasparente e bianco
                    if(document.getElementById('hero-slider')) {
                        nav.classList.add('bg-transparent', 'text-white');
                        nav.classList.remove('text-black');
                        if(logo) logo.classList.add('brightness-0', 'invert');
                    } else {
                        // Altre pagine (sfondo chiaro)
                        nav.classList.add('text-black');
                        if(logo) logo.classList.remove('brightness-0', 'invert');
                    }
                }
            };

            window.addEventListener('scroll', handleScroll);
            // Trigger iniziale
            handleScroll();
        }

        // Mobile Menu Toggle
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if(menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                const isOpen = !mobileMenu.classList.contains('translate-x-full');
                
                if(isOpen) {
                    // Chiudi
                    mobileMenu.classList.add('translate-x-full');
                    document.body.style.overflow = '';
                    // Ripristina colore hamburger
                    if(window.scrollY <= 50 && document.getElementById('hero-slider')) {
                        menuBtn.classList.add('text-white');
                        menuBtn.classList.remove('text-black');
                    }
                } else {
                    // Apri
                    mobileMenu.classList.remove('hidden');
                    // Force reflow
                    void mobileMenu.offsetWidth;
                    mobileMenu.classList.remove('translate-x-full');
                    document.body.style.overflow = 'hidden';
                    
                    // Hamburger diventa nero su sfondo chiaro
                    menuBtn.classList.remove('text-white');
                    menuBtn.classList.add('text-black');
                }
            });
            
            // Chiudi menu cliccando sui link
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('translate-x-full');
                    document.body.style.overflow = '';
                });
            });
        }

        // Gestione Slider Semplice per Homepage
        const slides = document.querySelectorAll('.hero-slide');
        if(slides.length > 0) {
            let current = 0;
            setInterval(() => {
                slides[current].classList.remove('opacity-100');
                slides[current].classList.add('opacity-0');
                
                current = (current + 1) % slides.length;
                
                slides[current].classList.remove('opacity-0');
                slides[current].classList.add('opacity-100');
            }, 6000); // Aumentato tempo di permanenza
        }

        // Copyright Year
        const yearSpan = document.getElementById('copyright-year');
        if(yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
});