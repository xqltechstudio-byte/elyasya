// Hero Slider Functionality
let currentSlide = 0;
let slides = [];
let totalSlides = 0;
let sliderInterval = null;

// Default slide data
const defaultSlides = [
    {
        id: 1,
        title: 'Design Interior',
        description: 'Wujudkan Ruang Impian Anda dengan Sentuhan Profesional',
        buttonText: 'Lihat Portfolio',
        buttonLink: '#design-interior',
        businessLine: 'Design Interior',
        bgColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        bgImage: '',
        status: 'active'
    },
    {
        id: 2,
        title: 'Management Consulting',
        description: 'Solusi Bisnis Terpadu untuk Pertumbuhan Perusahaan Anda',
        buttonText: 'Konsultasi Sekarang',
        buttonLink: '#management',
        businessLine: 'Management',
        bgColor: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
        bgImage: '',
        status: 'active'
    },
    {
        id: 3,
        title: 'Hijab Collection',
        description: 'Koleksi Hijab Premium untuk Gaya Muslimah Modern',
        buttonText: 'Lihat Katalog',
        buttonLink: '#hijab',
        businessLine: 'Hijab',
        bgColor: 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
        bgImage: '',
        status: 'active'
    },
    {
        id: 4,
        title: 'Kedai Sembako',
        description: 'Kebutuhan Harian Berkualitas di Dekat Anda',
        buttonText: 'Cek Lokasi',
        buttonLink: '#sembako',
        businessLine: 'Sembako',
        bgColor: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
        bgImage: '',
        status: 'active'
    },
    {
        id: 5,
        title: 'Travel Agent',
        description: 'Perjalanan Impian Anda Dimulai dari Sini',
        buttonText: 'Lihat Paket',
        buttonLink: '#travel',
        businessLine: 'Travel',
        bgColor: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
        bgImage: '',
        status: 'active'
    }
];

// Load slides data from localStorage
function loadSlidesData() {
    const savedSlides = localStorage.getItem('heroSlides');
    if (savedSlides) {
        try {
            const parsed = JSON.parse(savedSlides);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing hero slides:', e);
        }
    }
    return defaultSlides;
}

// Render hero slides dynamically
function renderHeroSlides() {
    const sliderContainer = document.getElementById('heroSlider');
    if (!sliderContainer) return;
    
    const slidesData = loadSlidesData();
    
    // Filter only active slides
    const activeSlides = slidesData.filter(s => s.status === 'active');
    
    // Clear container
    sliderContainer.innerHTML = '';
    
    // Render each slide
    activeSlides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('slide');
        if (index === 0) slideDiv.classList.add('active');
        
        // Set background
        if (slide.bgImage) {
            slideDiv.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.bgImage})`;
            slideDiv.style.backgroundSize = 'cover';
            slideDiv.style.backgroundPosition = 'center';
        } else {
            slideDiv.style.background = slide.bgColor || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        }
        
        // Set content
        slideDiv.innerHTML = `
            <div class="slide-content">
                <h2>${slide.title}</h2>
                <p>${slide.description}</p>
                <a href="${slide.buttonLink}" class="btn-primary">${slide.buttonText}</a>
            </div>
        `;
        
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
document.addEventListener('DOMContentLoaded', () => {
    renderHeroSlides();
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
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Get business type text
    const selectElement = document.getElementById('subject');
    const businessText = selectElement.options[selectElement.selectedIndex].text;
    
    // Create WhatsApp message
    const phoneNumber = '6281234567890'; // Replace with actual WhatsApp number
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
    alert('Terima kasih! Anda akan diarahkan ke WhatsApp untuk melanjutkan percakapan.');
    
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
// LOAD IMAGES FROM LOCALSTORAGE
// ==========================================

function getImageSrc(imageData) {
    // If it's a JSON string, parse it and get the src
    if (imageData && imageData.startsWith('{')) {
        try {
            const parsed = JSON.parse(imageData);
            return parsed.src || parsed.url || null;
        } catch (e) {
            return null;
        }
    }
    return imageData;
}

function loadImagesFromStorage() {
    // Load Header Logo (key: image_header)
    const headerData = localStorage.getItem('image_header');
    if (headerData) {
        const headerSrc = getImageSrc(headerData);
        if (headerSrc) {
            const logoElement = document.querySelector('.logo');
            if (logoElement) {
                const h1 = logoElement.querySelector('h1');
                if (h1) {
                    h1.style.display = 'none';
                }
                const img = document.createElement('img');
                img.src = headerSrc;
                img.alt = 'Elyasya Corp Logo';
                img.style.height = '50px';
                img.style.width = 'auto';
                logoElement.appendChild(img);
            }
        }
    }

    // Load Hero Images (keys: image_hero1, image_hero2, etc.)
    const heroSlides = document.querySelectorAll('.hero-slider .slide');
    const heroImageKeys = [
        'image_hero1',
        'image_hero2',
        'image_hero3',
        'image_hero4',
        'image_hero5'
    ];

    heroSlides.forEach((slide, index) => {
        const heroData = localStorage.getItem(heroImageKeys[index]);
        if (heroData) {
            const heroSrc = getImageSrc(heroData);
            if (heroSrc) {
                // Apply background with overlay
                slide.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroSrc})`;
                slide.style.backgroundSize = 'cover';
                slide.style.backgroundPosition = 'center';
            }
        }
    });

    // Load Footer Logo (key: image_footer)
    const footerData = localStorage.getItem('image_footer');
    if (footerData) {
        try {
            const parsed = JSON.parse(footerData);
            const footerSrc = parsed.src || parsed.url || null;
            if (footerSrc) {
                const footerSection = document.querySelector('.footer-section');
                if (footerSection) {
                    const h3 = footerSection.querySelector('h3');
                    if (h3) {
                        h3.style.display = 'none';
                    }
                    const img = document.createElement('img');
                    img.src = footerSrc;
                    img.alt = 'Elyasya Corp Footer Logo';
                    img.style.height = '40px';
                    img.style.width = 'auto';
                    img.style.marginBottom = '1rem';
                    footerSection.insertBefore(img, footerSection.firstChild);
                }
            }
            
            // Load Footer Background
            const footerBgSrc = parsed.bgSrc || null;
            if (footerBgSrc) {
                const footer = document.querySelector('.footer');
                if (footer) {
                    footer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url(${footerBgSrc})`;
                    footer.style.backgroundSize = 'cover';
                    footer.style.backgroundPosition = 'center';
                }
            }
        } catch (e) {
            console.error('Error parsing footer image data:', e);
        }
    }
}

// Load Page-Specific Images from Admin Panel
function loadPageImagesFromStorage() {
    // Detect current page
    const body = document.body;
    let currentPage = '';
    
    if (body.classList.contains('hijab-page')) currentPage = 'hijab';
    else if (body.classList.contains('sembako-page')) currentPage = 'sembako';
    else if (body.classList.contains('travel-page')) currentPage = 'travel';
    else if (body.classList.contains('design-page')) currentPage = 'design';
    else if (body.classList.contains('management-page')) currentPage = 'management';
    
    if (!currentPage) return; // Not a page with dynamic images
    
    // Load Hero Image
    const heroData = localStorage.getItem(`pageImage_${currentPage}_hero`);
    if (heroData) {
        try {
            const parsed = JSON.parse(heroData);
            const heroSrc = parsed.src || parsed.url || null;
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
        } catch (e) {
            console.error('Error loading hero image:', e);
        }
    }
    
    // Load About Image
    const aboutData = localStorage.getItem(`pageImage_${currentPage}_about`);
    if (aboutData) {
        try {
            const parsed = JSON.parse(aboutData);
            const aboutSrc = parsed.src || parsed.url || null;
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
        } catch (e) {
            console.error('Error loading about image:', e);
        }
    }
    
    // Load Gallery Images
    const galleryData = localStorage.getItem(`pageGallery_${currentPage}`);
    if (galleryData) {
        try {
            const parsed = JSON.parse(galleryData);
            if (parsed.images && parsed.images.length > 0) {
                // Handle different gallery selectors for different pages
                let galleryItems = [];
                
                if (currentPage === 'management') {
                    // Management page uses service cards with icons
                    const serviceCards = document.querySelectorAll('.services-grid .service-card');
                    parsed.images.forEach((imgData, index) => {
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
                        parsed.images.forEach((imgData, index) => {
                            if (galleryItems[index] && imgData.src) {
                                galleryItems[index].src = imgData.src;
                            }
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Error loading gallery images:', e);
        }
    }
    
    // Load Testimonials (for hijab page)
    if (currentPage === 'hijab') {
        const testiData = localStorage.getItem('pageTestimonials_hijab');
        if (testiData) {
            try {
                const parsed = JSON.parse(testiData);
                if (parsed.images && parsed.images.length > 0) {
                    const testiContainer = document.querySelector('.testimonials-container');
                    if (testiContainer) {
                        const testiCards = testiContainer.querySelectorAll('.testimonial-card');
                        parsed.images.forEach((imgData, index) => {
                            if (testiCards[index]) {
                                const img = testiCards[index].querySelector('img');
                                if (img && imgData.src) {
                                    img.src = imgData.src;
                                }
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('Error loading testimonials:', e);
            }
        }
    }
    
    // Load Testimonials for management page
    if (currentPage === 'management') {
        const testiData = localStorage.getItem('pageTestimonials_management');
        if (testiData) {
            try {
                const parsed = JSON.parse(testiData);
                if (parsed.images && parsed.images.length > 0) {
                    const testiCards = document.querySelectorAll('.mgmt-testimonials .testimonial-card');
                    parsed.images.forEach((imgData, index) => {
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
            } catch (e) {
                console.error('Error loading management testimonials:', e);
            }
        }
    }
}

// Load images when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadImagesFromStorage();
    loadPageImagesFromStorage();
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
