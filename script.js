// ==========================================
// INDEXEDDB MODULE (Same as admin panel)
// ==========================================

const DB_NAME = 'ElyasyaAdminDB';
const DB_VERSION = 1;
const STORE_NAME = 'adminData';

const IndexedDB = {
    db: null,

    async open() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    },

    async get(key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async set(key, value) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(value, key);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
};

// Hero Slider Functionality
let currentSlide = 0;
let slides = [];
let totalSlides = 0;
let sliderInterval = null;

// Default slide data dengan fallback gambar lokal (anti-404)
// Menggunakan jalur relatif yang aman untuk hosting/GitHub Pages
// 5 Slide untuk 5 Lini Bisnis Elyasya Corp
const defaultSlides = [
    {
        id: 1,
        title: 'Design Interior',
        description: 'Layanan desain interior profesional untuk rumah, kantor, dan komersial',
        buttonText: 'Lihat Portfolio',
        buttonLink: 'design-interior.html',
        businessLine: 'Design Interior',
        bgColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        bgImage: 'slide design.png',
        imageBase64: '',
        status: 'active'
    },
    {
        id: 2,
        title: 'Management',
        description: 'Konsultasi manajemen bisnis, optimasi operasional, dan strategi pertumbuhan',
        buttonText: 'Konsultasi Sekarang',
        buttonLink: 'management.html',
        businessLine: 'Management',
        bgColor: 'linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)',
        bgImage: 'slide management.png',
        imageBase64: '',
        status: 'active'
    },
    {
        id: 3,
        title: 'Hijab',
        description: 'Koleksi hijab premium dengan berbagai model dan bahan berkualitas tinggi',
        buttonText: 'Lihat Katalog',
        buttonLink: 'hijab.html',
        businessLine: 'Hijab',
        bgColor: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)',
        bgImage: 'slide hijab.png',
        imageBase64: '',
        status: 'active'
    },
    {
        id: 4,
        title: 'Kedai Sembako',
        description: 'Menyediakan kebutuhan sembako dan bahan pokok berkualitas dengan harga bersaing',
        buttonText: 'Cek Lokasi',
        buttonLink: 'sembako.html',
        businessLine: 'Sembako',
        bgColor: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
        bgImage: 'hero sembako.jpeg',
        imageBase64: '',
        status: 'active'
    },
    {
        id: 5,
        title: 'Travel Agent',
        description: 'Paket wisata, umroh, dan perjalanan bisnis dengan layanan terpercaya',
        buttonText: 'Lihat Paket',
        buttonLink: 'travel.html',
        businessLine: 'Travel',
        bgColor: 'linear-gradient(135deg, #e74c3c 0%, #f39c12 100%)',
        bgImage: 'slide travel.png',
        imageBase64: '',
        status: 'active'
    }
];

// Fallback image - digunakan jika gambar default juga tidak ditemukan
const FALLBACK_GRADIENT = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';

// Load slides data from IndexedDB (primary) with localStorage fallback
async function loadSlidesData() {
    // Try IndexedDB first (admin panel now saves here)
    try {
        const savedSlides = await IndexedDB.get('heroSlides');
        if (savedSlides) {
            if (Array.isArray(savedSlides) && savedSlides.length > 0) {
                console.log('Hero slides loaded from IndexedDB');
                return savedSlides;
            }
        }
    } catch (e) {
        console.warn('IndexedDB not available, trying localStorage:', e);
    }
    
    // Fallback to localStorage (for backward compatibility)
    const savedSlidesLocal = localStorage.getItem('heroSlides');
    if (savedSlidesLocal) {
        try {
            const parsed = JSON.parse(savedSlidesLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
                console.log('Hero slides loaded from localStorage (fallback)');
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing hero slides from localStorage:', e);
        }
    }
    
    console.log('Using default slides');
    return defaultSlides;
}

// Render hero slides dynamically dengan Base64 + Fallback handling
async function renderHeroSlides() {
    const sliderContainer = document.getElementById('heroSlider');
    if (!sliderContainer) return;
    
    const slidesData = await loadSlidesData();
    console.log('[DEBUG] renderHeroSlides received data:', slidesData);
    
    // Filter only active slides
    const activeSlides = slidesData.filter(s => s.status === 'active');
    console.log('[DEBUG] Active slides count:', activeSlides.length);
    
    // Jika tidak ada slide aktif, gunakan default
    if (activeSlides.length === 0) {
        console.warn('Tidak ada slide aktif, menggunakan default slides');
        activeSlides.push(...defaultSlides.filter(s => s.status === 'active'));
    }
    
    // Clear container
    sliderContainer.innerHTML = '';
    
    // Render each slide
    activeSlides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('slide');
        if (index === 0) slideDiv.classList.add('active');
        
        // === ANTI-404 IMAGE HANDLING ===
        // Prioritas: 1) Base64 dari IndexedDB/localStorage (imageBase64), 2) Path gambar default, 3) Gradient CSS
        let imageSrc = '';
        let useGradient = false;
        
        // Cek apakah ada gambar Base64 dari admin upload (field: imageBase64 atau bgImage)
        // imageBase64 adalah field utama yang digunakan admin panel
        const base64Image = slide.imageBase64 || slide.bgImage || '';
        console.log(`[DEBUG] Slide "${slide.title}" - imageBase64: ${base64Image ? 'Yes (length: ' + base64Image.length + ')' : 'No'}`);
        
        if (base64Image && base64Image.startsWith('data:image')) {
            // Base64 image dari admin upload (paling prioritas - anti 404)
            imageSrc = base64Image;
        } else if (slide.bgImageFallback || slide.bgImage) {
            // Fallback ke gambar default dari folder lokal
            // JANGAN ubah ke lowercase - server hosting case-sensitive!
            imageSrc = slide.bgImageFallback || slide.bgImage;
        } else {
            // Fallback terakhir: gradient CSS
            useGradient = true;
        }
        
        // Set content
        const safeTitle = escapeHtml(slide.title || 'Slide');
        const safeDesc = escapeHtml(slide.description || '');
        const safeBtnText = escapeHtml(slide.buttonText || 'Selengkapnya');
        const safeBtnLink = slide.buttonLink || '#';
        
        if (useGradient) {
            slideDiv.style.background = slide.bgColor || FALLBACK_GRADIENT;
            slideDiv.innerHTML = `
                <div class="slide-content">
                    <h2>${safeTitle}</h2>
                    <p>${safeDesc}</p>
                    <a href="${safeBtnLink}" class="btn-primary">${safeBtnText}</a>
                </div>
            `;
        } else {
            slideDiv.innerHTML = `
                <img class="slide-bg-image" src="${imageSrc}" alt="${safeTitle}" onerror="this.parentElement.style.background='${slide.bgColor || FALLBACK_GRADIENT}'; this.style.display='none';">
                <div class="slide-overlay"></div>
                <div class="slide-content">
                    <h2>${safeTitle}</h2>
                    <p>${safeDesc}</p>
                    <a href="${safeBtnLink}" class="btn-primary">${safeBtnText}</a>
                </div>
            `;
        }
        
        sliderContainer.appendChild(slideDiv);
    });
    
    // Update slides reference
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    // Reset current slide
    currentSlide = 0;
    
    // Rebuild dots
    rebuildDots();
    
    // Restart auto-advance
    restartAutoAdvance();
    
    console.log(`Hero Slider: ${totalSlides} slide aktif dimuat`);
}

// Utility: Escape HTML untuk mencegah XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Rebuild slider dots
function rebuildDots() {
    const dotsContainer = document.getElementById('sliderDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

// Restart auto-advance timer
function restartAutoAdvance() {
    if (sliderInterval) {
        clearInterval(sliderInterval);
    }
    sliderInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// Initialize slider on page load
document.addEventListener('DOMContentLoaded', async () => {
    await renderHeroSlides();
    renderBusinessCards(); // Render lini bisnis cards
});

function showSlide(n) {
    if (slides.length === 0) return;
    
    slides.forEach(slide => slide.classList.remove('active'));
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (n + totalSlides) % totalSlides;
    
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
}

function goToSlide(n) {
    showSlide(n);
}

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger icon
    const spans = hamburger.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Active Navigation Link on Scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// WhatsApp Integration Function
function openWhatsApp(businessType) {
    const phoneNumber = '6281234567890'; // Replace with actual WhatsApp number
    let message = '';
    
    switch(businessType) {
        case 'design':
            message = 'Halo, saya tertarik dengan layanan Design Interior dari Elyasya Corp. Bisa minta informasi lebih lanjut?';
            break;
        case 'management':
            message = 'Halo, saya ingin berkonsultasi tentang layanan Management dari Elyasya Corp.';
            break;
        case 'hijab':
            message = 'Halo, saya ingin melihat katalog Hijab dari Elyasya Corp.';
            break;
        case 'sembako':
            message = 'Halo, saya ingin mengetahui lokasi Kedai Sembako Elyasya Corp terdekat.';
            break;
        case 'travel':
            message = 'Halo, saya tertarik dengan paket travel dari Elyasya Corp. Bisa minta informasi?';
            break;
        default:
            message = 'Halo, saya ingin mengetahui lebih lanjut tentang Elyasya Corp.';
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Get business type text
    const selectElement = document.getElementById('subject');
    const businessText = selectElement.options[selectElement.selectedIndex].text;
    
    // Save message to IndexedDB for admin panel
    const messageData = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        subject: businessText,
        message: message,
        source: 'Contact Form',
        read: false,
        createdAt: new Date().toISOString()
    };
    
    try {
        // Get existing messages
        let messages = await IndexedDB.get('contactMessages') || [];
        if (!Array.isArray(messages)) messages = [];
        
        // Add new message
        messages.unshift(messageData);
        
        // Save back to IndexedDB
        await IndexedDB.set('contactMessages', messages);
        console.log('Message saved to IndexedDB for admin panel');
    } catch (err) {
        console.error('Failed to save message to IndexedDB:', err);
    }
    
    // Create WhatsApp message
    const phoneNumber = '6281334236869';
    const whatsappMessage = `*Pesan dari Website Elyasya Corp*\n\n` +
                           `Nama: ${name}\n` +
                           `Email: ${email}\n` +
                           `Telepon: ${phone}\n` +
                           `Lini Bisnis: ${businessText}\n\n` +
                           `Pesan:\n${message}`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Show success message
    alert('Terima kasih! Pesan Anda telah terkirim dan Anda akan diarahkan ke WhatsApp untuk melanjutkan percakapan.');
    
    // Reset form
    contactForm.reset();
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Scroll Animation for Cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.business-card, .news-card, .stat-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
});

// Add loading animation to page
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// ==========================================
// AUTO-REFRESH SLIDER WHEN LOCALSTORAGE CHANGES
// ==========================================

// Listen for storage changes from admin panel
window.addEventListener('storage', async function(e) {
    if (e.key === 'heroSlides') {
        console.log('Hero slider data changed, refreshing...');
        await renderHeroSlides();
    }
    if (e.key === 'liniBisnisData') {
        console.log('Lini Bisnis data changed, refreshing...');
        renderBusinessCards();
    }
});

// Also check for changes when page becomes visible (tab switch)
document.addEventListener('visibilitychange', async function() {
    if (!document.hidden) {
        await renderHeroSlides();
        renderBusinessCards();
    }
});

// ==========================================
// LINI BISNIS KAMI - DYNAMIC RENDERING
// ==========================================

const LINI_BISNIS_DEFAULT = [
    {
        id: 1,
        title: 'Design Interior',
        description: 'Layanan desain interior profesional untuk rumah, kantor, dan komersial. Dari konsep hingga eksekusi.',
        icon: 'logo design interior.png',
        link: 'design-interior.html',
        color: '#1e3c72',
        features: ['Konsultasi Gratis', 'Portfolio 100+ Proyek', 'Garansi Kepuasan'],
        buttonText: 'Lihat Portfolio',
        status: 'active'
    },
    {
        id: 2,
        title: 'Management',
        description: 'Konsultasi manajemen bisnis, optimasi operasional, dan strategi pertumbuhan perusahaan.',
        icon: 'logo management.jpeg',
        link: 'management.html',
        color: '#2a5298',
        features: ['Business Consulting', 'Asset Management', 'Strategic Planning'],
        buttonText: 'Konsultasi Sekarang',
        status: 'active'
    },
    {
        id: 3,
        title: 'Hijab',
        description: 'Koleksi hijab premium dengan berbagai model dan bahan berkualitas tinggi untuk muslimah modern.',
        icon: 'hijab logo.jpeg',
        link: 'hijab.html',
        color: '#8e44ad',
        features: ['Bahan Premium', 'Model Terkini', 'Harga Terjangkau'],
        buttonText: 'Lihat Katalog',
        status: 'active'
    },
    {
        id: 4,
        title: 'Kedai Sembako',
        description: 'Menyediakan kebutuhan sembako dan bahan pokok berkualitas dengan harga bersaing.',
        icon: 'logo kedai sembako.png',
        link: 'sembako.html',
        color: '#27ae60',
        features: ['Produk Berkualitas', 'Harga Kompetitif', 'Lokasi Strategis'],
        buttonText: 'Cek Lokasi',
        status: 'active'
    },
    {
        id: 5,
        title: 'Travel Agent',
        description: 'Paket wisata, umroh, dan perjalanan bisnis dengan layanan terpercaya dan harga terbaik.',
        icon: 'logo travel.jpeg',
        link: 'travel.html',
        color: '#e74c3c',
        features: ['Paket Tour Lengkap', 'Umroh & Haji', 'Ticketing'],
        buttonText: 'Lihat Paket',
        status: 'active'
    }
];

// Mapping logo tiap lini bisnis berdasarkan halaman (link)
const LOGO_LINI_BISNIS = {
    'design-interior.html': 'logo design interior.png',
    'management.html': 'logo management.jpeg',
    'hijab.html': 'hijab logo.jpeg',
    'sembako.html': 'logo kedai sembako.png',
    'travel.html': 'logo travel.jpeg'
};

// Cek apakah nilai icon berupa path/URL gambar
function isImageUrl(value) {
    if (!value || typeof value !== 'string') return false;
    const v = value.trim();
    return /^https?:\/\//i.test(v) || /\.(png|jpe?g|svg|webp|gif|bmp)$/i.test(v);
}

// Resolve icon lini bisnis: prioritaskan gambar logo, fallback emoji
function resolveLiniBisnisIcon(item) {
    if (isImageUrl(item.icon)) {
        return { type: 'image', src: item.icon };
    }
    if (item.link && LOGO_LINI_BISNIS[item.link]) {
        return { type: 'image', src: LOGO_LINI_BISNIS[item.link] };
    }
    return { type: 'emoji', value: item.icon || '🏢' };
}
function getLiniBisnisData() {
    const saved = localStorage.getItem('liniBisnisData');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return LINI_BISNIS_DEFAULT;
        }
    }
    return LINI_BISNIS_DEFAULT;
}

function renderBusinessCards() {
    const grid = document.getElementById('businessGrid');
    if (!grid) return;

    const items = getLiniBisnisData().filter(item => item.status === 'active');

    if (items.length === 0) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:#888;">Belum ada lini bisnis yang aktif.</p>';
        return;
    }

    grid.innerHTML = items.map(item => {
        const features = (item.features || []).map(f => `<li>✓ ${escapeHtml(f)}</li>`).join('');
        const btnText = escapeHtml(item.buttonText || 'Selengkapnya');
        const link = escapeHtml(item.link || '#');
        const icon = (function () { var r = resolveLiniBisnisIcon(item); if (r.type === 'image') { return '<img src="' + escapeHtml(r.src) + '" alt="' + escapeHtml(item.title || '') + ' Logo" class="card-logo" loading="lazy">'; } return escapeHtml(r.value); })();
        const title = escapeHtml(item.title || '');
        const desc = escapeHtml(item.description || '');
        const color = item.color || '#2a5298';

        return `
            <div class="business-card" id="${title.toLowerCase().replace(/\s+/g, '-')}">
                <div class="card-icon" style="background: #ffffff; border: 3px solid ${color}; -webkit-background-clip: initial; -webkit-text-fill-color: initial; color: white; width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 1rem; box-shadow: 0 6px 16px rgba(0,0,0,0.12); overflow: hidden;">${icon}</div>
                <h3>${title}</h3>
                <p>${desc}</p>
                <ul class="feature-list">
                    ${features}
                </ul>
                <a href="${link}" class="btn-secondary">${btnText}</a>
            </div>
        `;
    }).join('');

    // Re-observe new cards for scroll animation
    grid.querySelectorAll('.business-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
}

// Load Page-Specific Images from Admin Panel
async function loadPageImagesFromStorage() {
    // Detect current page
    const body = document.body;
    let currentPage = '';
    
    if (body.classList.contains('hijab-page')) currentPage = 'hijab';
    else if (body.classList.contains('sembako-page')) currentPage = 'sembako';
    else if (body.classList.contains('travel-page')) currentPage = 'travel';
    else if (body.classList.contains('design-page')) currentPage = 'design';
    else if (body.classList.contains('management-page')) currentPage = 'management';
    
    if (!currentPage) return; // Not a page with dynamic images
    
    // Helper function to get data from IndexedDB with localStorage fallback
    async function getData(key) {
        // Try IndexedDB first
        try {
            const data = await IndexedDB.get(key);
            if (data) {
                console.log(`Loaded ${key} from IndexedDB`);
                return data;
            }
        } catch (e) {
            console.warn(`IndexedDB not available for ${key}, trying localStorage`);
        }
        
        // Fallback to localStorage
        const localData = localStorage.getItem(key);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                console.log(`Loaded ${key} from localStorage (fallback)`);
                return parsed;
            } catch (e) {
                console.error(`Error parsing ${key} from localStorage:`, e);
            }
        }
        return null;
    }
    
    // Load Hero Image
    const heroData = await getData(`pageImage_${currentPage}_hero`);
    if (heroData) {
        const heroSrc = heroData.src || heroData.url || null;
        if (heroSrc) {
            // Handle different hero section selectors for different pages
            let heroSection = document.querySelector('.page-hero');
            if (!heroSection && currentPage === 'management') {
                heroSection = document.querySelector('.mgmt-hero');
            }
            if (heroSection) {
                heroSection.style.background = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroSrc})`;
                heroSection.style.backgroundSize = 'cover';
                heroSection.style.backgroundPosition = 'center';
            }
        }
    }
    
    // Load About Image
    const aboutData = await getData(`pageImage_${currentPage}_about`);
    if (aboutData) {
        const aboutSrc = aboutData.src || aboutData.url || null;
        if (aboutSrc) {
            // Handle different about image selectors for different pages
            let aboutImg = document.querySelector('.about-image img');
            if (!aboutImg && currentPage === 'management') {
                aboutImg = document.querySelector('.about-img-main');
            }
            if (aboutImg) {
                // If it's an img element, set src; if it's a div, set background
                if (aboutImg.tagName === 'IMG') {
                    aboutImg.src = aboutSrc;
                } else {
                    aboutImg.style.background = `url(${aboutSrc})`;
                    aboutImg.style.backgroundSize = 'cover';
                    aboutImg.style.backgroundPosition = 'center';
                    // Hide the icon display if present
                    const iconDisplay = aboutImg.querySelector('.icon-display');
                    if (iconDisplay) {
                        iconDisplay.style.display = 'none';
                    }
                }
            }
        }
    }
    
    // Load Gallery Images
    const galleryData = await getData(`pageGallery_${currentPage}`);
    if (galleryData && galleryData.images && galleryData.images.length > 0) {
        // Handle different gallery selectors for different pages
        let galleryItems = [];
        
        if (currentPage === 'management') {
            // Management page uses service cards with icons
            const serviceCards = document.querySelectorAll('.services-grid .service-card');
            galleryData.images.forEach((imgData, index) => {
                if (serviceCards[index] && imgData.src) {
                    const serviceIcon = serviceCards[index].querySelector('.service-icon');
                    if (serviceIcon) {
                        serviceIcon.style.background = `url(${imgData.src})`;
                        serviceIcon.style.backgroundSize = 'cover';
                        serviceIcon.style.backgroundPosition = 'center';
                        // Hide the emoji icon
                        serviceIcon.textContent = '';
                    }
                }
            });
        } else {
            const galleryGrid = document.querySelector('.products-grid, .gallery-grid, .destinations-grid, .portfolio-grid');
            if (galleryGrid) {
                galleryItems = galleryGrid.querySelectorAll('.product-card img, .gallery-item img, .destination-card img, .portfolio-item img');
                galleryData.images.forEach((imgData, index) => {
                    if (galleryItems[index] && imgData.src) {
                        galleryItems[index].src = imgData.src;
                    }
                });
            }
        }
    }
    
    // Load Testimonials (for hijab page)
    if (currentPage === 'hijab') {
        const testiData = await getData('pageTestimonials_hijab');
        if (testiData && testiData.images && testiData.images.length > 0) {
            const testiContainer = document.querySelector('.testimonials-container');
            if (testiContainer) {
                const testiCards = testiContainer.querySelectorAll('.testimonial-card');
                testiData.images.forEach((imgData, index) => {
                    if (testiCards[index]) {
                        const img = testiCards[index].querySelector('img');
                        if (img && imgData.src) {
                            img.src = imgData.src;
                        }
                    }
                });
            }
        }
    }
    
    // Load Testimonials for management page
    if (currentPage === 'management') {
        const testiData = await getData('pageTestimonials_management');
        if (testiData && testiData.images && testiData.images.length > 0) {
            const testiCards = document.querySelectorAll('.mgmt-testimonials .testimonial-card');
            testiData.images.forEach((imgData, index) => {
                if (testiCards[index]) {
                    const avatar = testiCards[index].querySelector('.testimonial-avatar');
                    if (avatar && imgData.src) {
                        avatar.style.background = `url(${imgData.src})`;
                        avatar.style.backgroundSize = 'cover';
                        avatar.style.backgroundPosition = 'center';
                        avatar.textContent = '';
                    }
                }
            });
        }
    }
}

// Load images when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Hero slider sudah di-render oleh renderHeroSlides() di atas
    // loadPageImagesFromStorage() untuk halaman sub-pages
    await loadPageImagesFromStorage();
});

console.log('Elyasya Corp Website Loaded Successfully! 🚀');
console.log('Website Features:');
console.log('✓ Hero Slider with 5 Business Units');
console.log('✓ Responsive Navigation');
console.log('✓ WhatsApp Integration');
console.log('✓ Contact Form');
console.log('✓ Smooth Scrolling');
console.log('✓ Scroll Animations');
console.log('✓ Dynamic Image Loading from Admin Panel');
