/* global AOS */
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
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');

                const fixPath = (val) => {
                    if (!val || val.startsWith('http') || val.startsWith('//') || val.startsWith('#') || val.startsWith('mailto:') || val.startsWith('data:')) {
                        return val;
                    }

                    if (basePath === '../') {
                        if (val.startsWith('../')) return val;
                        return '../' + val;
                    }
                    else {
                        if (val.startsWith('../')) return val.substring(3);
                        return val;
                    }
                };

                doc.querySelectorAll('a').forEach(el => {
                    const href = el.getAttribute('href');
                    if (href) el.setAttribute('href', fixPath(href));
                });
                doc.querySelectorAll('img').forEach(el => {
                    const src = el.getAttribute('src');
                    if (src) el.setAttribute('src', fixPath(src));
                });

                element.innerHTML = doc.body.innerHTML;

                const scripts = element.querySelectorAll("script");
                scripts.forEach(script => {
                    const newScript = document.createElement("script");
                    newScript.textContent = script.textContent;
                    if (script.src) newScript.src = script.src;
                    document.body.appendChild(newScript);
                });
            })
            .catch(error => console.error(error));
    };

    function initializeSite() {
        setupNav();
        setupProjectAnimations();
        updateCopyrightYear();
        setupProjectNavScroll();
        setupCookieBanner();

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

    function loadGoogleAnalytics() {
        if (document.getElementById('ga-script')) return;

        const gaId = 'G-XSYWT4G6T5';

        const script = document.createElement('script');
        script.id = 'ga-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', gaId);
    }

    function setupCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('cookie-accept');
        const rejectBtn = document.getElementById('cookie-reject');

        if (!banner || !acceptBtn || !rejectBtn) return;

        const cookieConsent = localStorage.getItem('cookieConsent');

        if (cookieConsent === 'accepted') {
            loadGoogleAnalytics();
        } else if (!cookieConsent) {
            setTimeout(() => {
                banner.classList.remove('translate-y-full');
            }, 2000);
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.classList.add('translate-y-full');
            loadGoogleAnalytics();
        });

        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'rejected');
            banner.classList.add('translate-y-full');
        });
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
                        document.body.style.touchAction = 'none';
                        void mobileMenu.offsetWidth;
                        mobileMenu.classList.remove('translate-x-full');
                        mobileMenu.classList.add('open');

                        nav.classList.remove('bg-transparent', 'text-white');
                        nav.classList.add('text-black');
                        if (logo) logo.classList.remove('brightness-0', 'invert');

                        menuSpans.forEach(s => { s.classList.add('bg-black'); s.classList.remove('bg-white'); });

                    } else {
                        mobileMenu.classList.remove('open');
                        mobileMenu.classList.add('translate-x-full');
                        document.body.style.overflow = '';
                        document.body.style.touchAction = '';
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

                link.classList.remove('opacity-50');

                if (cleanHref === currentPath) {
                    link.classList.add('active-nav-link');
                    const underline = link.querySelector('span.absolute');
                    if (underline) {
                        underline.classList.remove('scale-x-0');
                        underline.classList.add('scale-x-100');
                    }
                    if (link.textContent.trim() === 'Contattaci') {
                        link.classList.add('bg-stone-900', 'text-white', 'border-transparent');
                    }
                }
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
                card.setAttribute('data-aos-delay', delay.toString());
            }
        });
    }

    function setupTextRevealAnimation() {
        const textElements = document.querySelectorAll('.reveal-text');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
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

    function setupProjectNavScroll() {
        const navTitle = document.getElementById('nav-project-title');
        const projectTitleH1 = document.querySelector('h1');

        if (navTitle && projectTitleH1) {
            navTitle.textContent = projectTitleH1.textContent;

            const heroImageContainer = projectTitleH1.closest('.relative');

            if (heroImageContainer) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) {
                            navTitle.classList.remove('opacity-0');
                        } else {
                            navTitle.classList.add('opacity-0');
                        }
                    });
                }, { threshold: 0, rootMargin: "-60px 0px 0px 0px" });

                observer.observe(heroImageContainer);
            }
        }
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