document.addEventListener("DOMContentLoaded", function() {

    const loadHTML = (elementId, filePath) => {
        const element = document.getElementById(elementId);
        if (!element) return Promise.resolve();

        return fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(filePath);
                return response.text();
            })
            .then(data => {
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

                const scripts = element.querySelectorAll("script");
                scripts.forEach(script => {
                    const newScript = document.createElement("script");
                    newScript.textContent = script.textContent;
                    if(script.src) newScript.src = script.src;
                    document.body.appendChild(newScript);
                });
            })
            .catch(error => console.error(error));
    };

    function initializeSite() {
        setupNav();
        setupParallax();
        setupProjectAnimations();
        updateCopyrightYear();

        setTimeout(() => {
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    once: true,
                    duration: 1000,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    offset: 60,
                    anchorPlacement: 'top-bottom',
                });
                AOS.refresh();
            }
            setupTextRevealAnimation();
        }, 150);
    }

    function setupParallax() {
        if (window.innerWidth < 768) return;

        const parallaxImages = document.querySelectorAll('.parallax-img');
        if (parallaxImages.length === 0) return;

        parallaxImages.forEach(img => {
            if(img.parentElement) {
                img.parentElement.style.overflow = 'hidden';
            }
            img.style.transform = 'scale(1.15)';
        });

        let ticking = false;

        const updateParallax = () => {
            const viewportHeight = window.innerHeight;
            const viewportCenter = viewportHeight / 2;

            parallaxImages.forEach(img => {
                const container = img.parentElement;
                if (!container) return;

                const rect = container.getBoundingClientRect();

                if (rect.bottom > 0 && rect.top < viewportHeight) {
                    const containerCenter = rect.top + rect.height / 2;
                    const distFromCenter = containerCenter - viewportCenter;
                    let speed = parseFloat(img.getAttribute('data-speed') || 0.08);

                    if (img.classList.contains('parallax-top')) {
                        speed = 0.4;
                    }

                    const translateY = distFromCenter * speed;
                    img.style.transform = `translateY(${translateY}px) scale(1.15)`;
                }
            });
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });

        updateParallax();
    }

    function setupNav() {
        const nav = document.getElementById('main-nav');
        const projectNav = document.getElementById('project-nav');

        if (nav) {
            const logo = document.getElementById('nav-logo');
            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const menuSpans = menuBtn ? menuBtn.querySelectorAll('span') : [];

            const path = window.location.pathname;
            const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/SitoZup/') || path.endsWith('/SitoZup');

            let isMenuOpen = false;

            const updateNavState = () => {
                if (isMenuOpen) return;
                const isScrolled = window.scrollY > 50;

                if (isHomePage) {
                    if (isScrolled) {
                        nav.classList.remove('bg-transparent', 'text-white', 'py-6');
                        nav.classList.add('glass-nav', 'text-black', 'py-4', 'shadow-sm');
                        if (logo) logo.classList.remove('brightness-0', 'invert');
                    } else {
                        nav.classList.add('bg-transparent', 'text-white', 'py-6');
                        nav.classList.remove('glass-nav', 'text-black', 'py-4', 'shadow-sm');
                        if (logo) logo.classList.add('brightness-0', 'invert');
                    }
                } else {
                    nav.classList.add('glass-nav', 'text-black', 'py-4');
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

                        nav.classList.remove('bg-transparent', 'text-white');
                        nav.classList.add('text-black');
                        if (logo) logo.classList.remove('brightness-0', 'invert');

                        menuSpans.forEach(s => { s.classList.add('bg-black'); s.classList.remove('bg-white'); });

                    } else {
                        mobileMenu.classList.add('translate-x-full');
                        document.body.style.overflow = '';
                        setTimeout(() => mobileMenu.classList.add('hidden'), 500);

                        updateNavState();
                        if(isHomePage && window.scrollY < 50) {
                            menuSpans.forEach(s => { s.classList.add('bg-white'); s.classList.remove('bg-black'); });
                        }
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

                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        if (isMenuOpen) menuBtn.click();
                    });
                });
            }
            updateNavState();

            const navLinks = document.querySelectorAll('.nav-link');
            const currentPath = path.split('/').pop() || 'index.html';
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const cleanHref = href ? href.replace('../', '') : '';
                if (cleanHref === currentPath) link.classList.add('opacity-50');
            });
        }

        if (projectNav) projectNav.style.zIndex = '50';
    }

    function setupProjectAnimations() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            if (!card.hasAttribute('data-aos')) {
                card.setAttribute('data-aos', 'fade-up');
            }
            if (!card.hasAttribute('data-aos-delay')) {
                const delay = 50 + (index % 3) * 100;
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
                    setTimeout(() => el.classList.add('reveal-text-anim'), delay);
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

    let basePath = '';
    const pathname = window.location.pathname;

    if (pathname.indexOf('/progetti/') !== -1) {
        basePath = '../';
    } else {
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