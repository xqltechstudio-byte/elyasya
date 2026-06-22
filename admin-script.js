// Admin Dashboard Script - Elyasya Corp

// ==========================================
// LOGIN HANDLER FUNCTION
// ==========================================

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Demo credentials
    const validEmail = 'admin@elyasyacorp.com';
    const validPassword = 'admin123';
    
    // Check if email and password are correct
    if (email === validEmail && password === validPassword) {
        // Hide login page and show dashboard
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboardWrapper').style.display = 'flex';
        
        // Initialize dashboard after login
        initializeDashboardAfterLogin();
        showToast('Login berhasil! Selamat datang, Admin.', 'success');
    } else {
        showToast('Email atau password salah!', 'error');
    }
}

// Initialize Dashboard after successful login
function initializeDashboardAfterLogin() {
    // Initialize charts if they exist
    if (typeof initCharts === 'function') {
        initCharts();
    }
    
    // Load saved data
    if (typeof loadSavedImages === 'function') {
        loadSavedImages();
    }
    if (typeof loadAllPageImages === 'function') {
        loadAllPageImages();
    }
    if (typeof loadAllManagementData === 'function') {
        loadAllManagementData();
    }
    
    // Set current date for date filters
    const now = new Date();
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDateInput.valueAsDate = startDate;
    }
    if (endDateInput) {
        endDateInput.valueAsDate = now;
    }
    
    // Show dashboard section by default
    showSection('dashboard');
}

// Logout Handler Function
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Show login page and hide dashboard
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('dashboardWrapper').style.display = 'none';
        
        // Reset form
        document.getElementById('loginForm').reset();
        document.getElementById('twoFactorGroup').style.display = 'none';
        
        showToast('Anda telah berhasil logout.', 'info');
    }
}

// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const mainContent = document.querySelector('.main-content');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Set up event listeners
    setupEventListeners();
    
    // Load saved data from localStorage
    loadSavedData();
    
    // Load all page logos
    loadAllPageLogos();
    
    // Show welcome toast
    showToast('Selamat datang di Admin Dashboard!', 'info');
}

// Event Listeners Setup
function setupEventListeners() {
    // Menu toggle for mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });

    // Form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Filter changes
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', handleFilterChange);
    });
}

// Sidebar Toggle
function toggleSidebar() {
    if (window.innerWidth <= 992) {
        sidebar.classList.toggle('show');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById('section-' + sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNav = document.querySelector(`.nav-item[href="#${sectionId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 992) {
        sidebar.classList.remove('show');
    }

    // Update URL hash
    window.location.hash = sectionId;
}

// Business Tab Switching
function showBusinessTab(tabId) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load business data for selected tab
    loadBusinessData(tabId);
    
    showToast(`Data lini bisnis "${tabId}" dimuat`, 'info');
}

// Load Business Data
function loadBusinessData(tabId) {
    const businessData = {
        design: {
            name: 'Design Interior',
            icon: '🏠',
            description: 'Layanan desain interior profesional untuk rumah, kantor, dan komersial. Dari konsep hingga eksekusi.',
            features: 'Konsultasi Gratis\nPortfolio 100+ Proyek\nGaransi Kepuasan',
            whatsapp: '+62 812 3456 7890',
            status: 'aktif',
            image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=250&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=150&fit=crop'
            ]
        },
        management: {
            name: 'Management Consulting',
            icon: '📊',
            description: 'Jasa konsultasi manajemen bisnis untuk meningkatkan efisiensi dan profitabilitas perusahaan.',
            features: 'Analisis Bisnis\nStrategi Pertumbuhan\nPelatihan SDM',
            whatsapp: '+62 812 3456 7891',
            status: 'aktif',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=150&fit=crop'
            ]
        },
        hijab: {
            name: 'Hijab Collection',
            icon: '🧕',
            description: 'Koleksi hijab premium dengan berbagai model dan bahan berkualitas tinggi.',
            features: 'Bahan Premium\nDesain Eksklusif\nHarga Terjangkau',
            whatsapp: '+62 812 3456 7892',
            status: 'aktif',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=150&fit=crop'
            ]
        },
        sembako: {
            name: 'Kedai Sembako',
            icon: '🛒',
            description: 'Menyediakan kebutuhan pokok sehari-hari dengan harga bersaing dan kualitas terjamin.',
            features: 'Harga Grosir\nProduk Segar\nLayanan Antar',
            whatsapp: '+62 812 3456 7893',
            status: 'aktif',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=150&fit=crop'
            ]
        },
        travel: {
            name: 'Travel Agent',
            icon: '✈️',
            description: 'Layanan perjalanan lengkap termasuk tiket pesawat, hotel, dan paket wisata.',
            features: 'Paket Umroh\nTiket Pesawat\nBooking Hotel',
            whatsapp: '+62 812 3456 7894',
            status: 'aktif',
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=150&fit=crop',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=150&fit=crop'
            ]
        }
    };

    const data = businessData[tabId];
    if (data) {
        // Load from localStorage if available
        const savedData = localStorage.getItem('business_' + tabId);
        const finalData = savedData ? JSON.parse(savedData) : data;
        
        // Update form fields
        const nameInput = document.getElementById('businessName');
        const iconInput = document.getElementById('businessIcon');
        const descInput = document.getElementById('businessDesc');
        const featuresInput = document.getElementById('businessFeatures');
        const whatsappInput = document.getElementById('businessWhatsapp');
        const statusInput = document.getElementById('businessStatus');
        
        if (nameInput) nameInput.value = finalData.name || '';
        if (iconInput) iconInput.value = finalData.icon || '';
        if (descInput) descInput.value = finalData.description || '';
        if (featuresInput) featuresInput.value = finalData.features || '';
        if (whatsappInput) whatsappInput.value = finalData.whatsapp || '';
        if (statusInput) statusInput.value = finalData.status || 'aktif';
        
        // Update image previews
        const businessImagePreview = document.getElementById('businessImagePreview');
        if (businessImagePreview && finalData.image) {
            businessImagePreview.src = finalData.image;
        }
        
        // Update gallery previews
        if (finalData.gallery && Array.isArray(finalData.gallery)) {
            finalData.gallery.forEach((img, index) => {
                const galleryPreview = document.getElementById('gallery' + (index + 1) + 'Preview');
                if (galleryPreview && img) {
                    galleryPreview.src = img;
                }
            });
        }
        
        // Store current tab for saving
        window.currentBusinessTab = tabId;
    }
}

// Preview Business Image from file upload
function previewBusinessImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file terlalu besar! Maksimal 2MB', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar!', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('businessImagePreview');
            if (preview) {
                preview.src = e.target.result;
            }
            // Clear URL input
            const urlInput = document.getElementById('businessImageUrl');
            if (urlInput) urlInput.value = '';
        };
        reader.readAsDataURL(file);
    }
}

// Preview Business Image from URL
function previewBusinessImageFromUrl(url) {
    if (url) {
        const preview = document.getElementById('businessImagePreview');
        if (preview) {
            preview.src = url;
        }
        // Clear file input
        const fileInput = document.getElementById('businessImage');
        if (fileInput) fileInput.value = '';
    }
}

// Preview Gallery Image from file upload
function previewGalleryImage(input, previewId) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file terlalu besar! Maksimal 2MB', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = e.target.result;
            }
            // Clear corresponding URL input
            const urlInput = document.getElementById(previewId.replace('Preview', '') + 'Url');
            if (urlInput) urlInput.value = '';
        };
        reader.readAsDataURL(file);
    }
}

// Preview Gallery Image from URL
function previewGalleryFromUrl(url, previewId) {
    if (url) {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.src = url;
        }
        // Clear corresponding file input
        const fileInput = document.getElementById(previewId.replace('Preview', '') + 'Image');
        if (fileInput) fileInput.value = '';
    }
}

// Save Business Data including images
function saveBusinessData() {
    const tabId = window.currentBusinessTab || 'design';
    
    // Collect form data
    const businessData = {
        name: document.getElementById('businessName')?.value || '',
        icon: document.getElementById('businessIcon')?.value || '',
        description: document.getElementById('businessDesc')?.value || '',
        features: document.getElementById('businessFeatures')?.value || '',
        whatsapp: document.getElementById('businessWhatsapp')?.value || '',
        status: document.getElementById('businessStatus')?.value || 'aktif',
        image: document.getElementById('businessImagePreview')?.src || '',
        gallery: [
            document.getElementById('gallery1Preview')?.src || '',
            document.getElementById('gallery2Preview')?.src || '',
            document.getElementById('gallery3Preview')?.src || ''
        ]
    };
    
    // Save to localStorage
    localStorage.setItem('business_' + tabId, JSON.stringify(businessData));
    
    showToast(`Data lini bisnis "${businessData.name}" berhasil disimpan!`, 'success');
}

// Reset Business Form
function resetBusinessForm() {
    if (confirm('Apakah Anda yakin ingin mereset form? Data yang belum disimpan akan hilang.')) {
        const tabId = window.currentBusinessTab || 'design';
        // Remove saved data
        localStorage.removeItem('business_' + tabId);
        // Reload default data
        loadBusinessData(tabId);
        showToast('Form telah direset ke default', 'info');
    }
}

// Form Submit Handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Simulate saving data
    showToast('Data berhasil disimpan!', 'success');
    
    // Save to localStorage (demo)
    saveFormData(form);
}

// Save Form Data
function saveFormData(form) {
    const formData = {};
    form.querySelectorAll('input, textarea, select').forEach(field => {
        if (field.name || field.id) {
            formData[field.name || field.id] = field.value;
        }
    });
    
    const formKey = form.className + '_data';
    localStorage.setItem(formKey, JSON.stringify(formData));
}

// Load Saved Data
function loadSavedData() {
    // Load dashboard stats
    const savedStats = localStorage.getItem('dashboard_stats');
    if (savedStats) {
        updateStats(JSON.parse(savedStats));
    }
}

// Update Stats
function updateStats(stats) {
    const statCards = document.querySelectorAll('.stat-card .stat-info h3');
    if (statCards.length >= 4) {
        if (stats.visitors) statCards[0].textContent = stats.visitors;
        if (stats.messages) statCards[1].textContent = stats.messages;
        if (stats.articles) statCards[2].textContent = stats.articles;
        if (stats.business) statCards[3].textContent = stats.business;
    }
}

// Filter Change Handler
function handleFilterChange(e) {
    const filterType = e.target.previousElementSibling ? 'secondary' : 'primary';
    applyFilters();
}

// Apply Filters
function applyFilters() {
    const filters = {};
    document.querySelectorAll('.filter-select').forEach(select => {
        filters[select.name || 'filter_' + Math.random()] = select.value;
    });
    
    // Filter messages based on selection
    filterMessages(filters);
}

// Filter Messages
function filterMessages(filters) {
    const messages = document.querySelectorAll('.message-item');
    messages.forEach(message => {
        let show = true;
        
        // Apply business filter
        if (filters.business && filters.business !== 'Semua Lini Bisnis') {
            const badge = message.querySelector('.badge');
            if (badge && !badge.textContent.includes(filters.business)) {
                show = false;
            }
        }
        
        // Apply status filter
        if (filters.status && filters.status !== 'Semua Status') {
            const isUnread = message.classList.contains('unread');
            if ((filters.status === 'Belum Dibaca' && !isUnread) ||
                (filters.status === 'Sudah Dibaca' && isUnread)) {
                show = false;
            }
        }
        
        message.style.display = show ? 'block' : 'none';
    });
}

// ==========================================
// HERO SLIDER MANAGEMENT (Full CRUD)
// ==========================================

// Default slides data
const defaultHeroSlides = [
    {
        id: 1,
        title: 'Design Interior',
        description: 'Wujudkan Ruang Impian Anda dengan Sentuhan Profesional',
        buttonText: 'Lihat Portfolio',
        buttonLink: '#design-interior',
        businessLine: 'Design Interior',
        bgColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        bgImage: '',
        status: 'active',
        order: 0
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
        status: 'active',
        order: 1
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
        status: 'active',
        order: 2
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
        status: 'active',
        order: 3
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
        status: 'active',
        order: 4
    }
];

// Load slides from localStorage
function loadHeroSlides() {
    const saved = localStorage.getItem('heroSlides');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing hero slides:', e);
        }
    }
    return [...defaultHeroSlides];
}

// Save slides to localStorage
function saveHeroSlides(slides) {
    localStorage.setItem('heroSlides', JSON.stringify(slides));
}

// Render slides table
function renderSlidesTable() {
    const tbody = document.getElementById('slidesTableBody');
    if (!tbody) return;
    
    const slides = loadHeroSlides();
    slides.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Update total slides count
    const totalSlidesCount = document.getElementById('totalSlidesCount');
    if (totalSlidesCount) {
        totalSlidesCount.textContent = `${slides.length} Slide${slides.length !== 1 ? 's' : ''}`;
    }
    
    tbody.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const statusBadge = slide.status === 'active' 
            ? '<span class="badge badge-success">Aktif</span>' 
            : '<span class="badge badge-secondary">Nonaktif</span>';
        
        const businessBadge = getBusinessBadge(slide.businessLine);
        
        // Create preview thumbnail
        let previewHtml = '';
        if (slide.bgImage) {
            previewHtml = `<div class="slide-preview-thumb" style="background-image: url(${slide.bgImage});"></div>`;
        } else {
            previewHtml = `<div class="slide-preview-thumb" style="background: ${slide.bgColor || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'};"></div>`;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${previewHtml}</td>
            <td><strong>${slide.title}</strong></td>
            <td>${slide.description.substring(0, 40)}...</td>
            <td>${businessBadge}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-icon" onclick="editSlide(${slide.id})" title="Edit">✏️</button>
                <button class="btn-icon" onclick="viewSlide(${slide.id})" title="Detail">👁️</button>
                <button class="btn-icon" onclick="deleteSlide(${slide.id})" title="Hapus">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Also render grid view
    renderSlidesGridView();
}

// Render slides grid view
function renderSlidesGridView() {
    const gridView = document.getElementById('slidesGridView');
    if (!gridView) return;
    
    const slides = loadHeroSlides();
    slides.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    gridView.innerHTML = '';
    
    if (slides.length === 0) {
        gridView.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🎨</span>
                <h3>Belum Ada Slide</h3>
                <p>Klik tombol "Tambah Slide" untuk membuat slide pertama Anda</p>
            </div>
        `;
        return;
    }
    
    slides.forEach((slide, index) => {
        const slideCard = document.createElement('div');
        slideCard.className = `slide-grid-card ${slide.status === 'inactive' ? 'inactive' : ''}`;
        
        // Create background preview
        let bgStyle = '';
        if (slide.bgImage) {
            bgStyle = `background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.bgImage});`;
        } else {
            bgStyle = `background: ${slide.bgColor || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'};`;
        }
        
        slideCard.innerHTML = `
            <div class="slide-card-preview" style="${bgStyle}">
                <div class="slide-card-overlay">
                    <span class="slide-order-badge">#${index + 1}</span>
                    <span class="slide-status-badge ${slide.status === 'active' ? 'active' : 'inactive'}">
                        ${slide.status === 'active' ? '● Aktif' : '○ Nonaktif'}
                    </span>
                </div>
                <div class="slide-card-content-preview">
                    <h4>${slide.title}</h4>
                    <p>${slide.description.substring(0, 50)}...</p>
                </div>
            </div>
            <div class="slide-card-footer">
                <div class="slide-card-info">
                    <span class="business-tag">${slide.businessLine || 'Umum'}</span>
                </div>
                <div class="slide-card-actions">
                    <button class="btn-icon-small" onclick="editSlide(${slide.id})" title="Edit">✏️</button>
                    <button class="btn-icon-small" onclick="quickChangeImage(${slide.id})" title="Ganti Gambar">🖼️</button>
                    <button class="btn-icon-small" onclick="toggleSlideStatus(${slide.id})" title="Toggle Status">
                        ${slide.status === 'active' ? '🔴' : '🟢'}
                    </button>
                    <button class="btn-icon-small" onclick="deleteSlide(${slide.id})" title="Hapus">🗑️</button>
                </div>
            </div>
        `;
        
        gridView.appendChild(slideCard);
    });
}

// Quick change image for slide
function quickChangeImage(id) {
    const slides = loadHeroSlides();
    const slide = slides.find(s => s.id === id);
    if (!slide) {
        showToast('Slide tidak ditemukan', 'error');
        return;
    }
    
    // Create a temporary file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Ukuran file terlalu besar! Maksimal 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                // Update slide with new image
                slide.bgImage = event.target.result;
                saveHeroSlides(slides);
                renderSlidesTable();
                showToast(`Gambar slide "${slide.title}" berhasil diubah!`, 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    fileInput.click();
}

// Toggle slide status
function toggleSlideStatus(id) {
    const slides = loadHeroSlides();
    const slide = slides.find(s => s.id === id);
    if (!slide) {
        showToast('Slide tidak ditemukan', 'error');
        return;
    }
    
    slide.status = slide.status === 'active' ? 'inactive' : 'active';
    saveHeroSlides(slides);
    renderSlidesTable();
    
    const statusText = slide.status === 'active' ? 'diaktifkan' : 'dinonaktifkan';
    showToast(`Slide "${slide.title}" berhasil ${statusText}`, 'success');
}

// Get business line badge
function getBusinessBadge(businessLine) {
    const badgeColors = {
        'Design Interior': 'badge-blue',
        'Management': 'badge-green',
        'Hijab': 'badge-purple',
        'Sembako': 'badge-orange',
        'Travel': 'badge-orange',
        'Umum': 'badge-secondary'
    };
    const colorClass = badgeColors[businessLine] || 'badge-secondary';
    return `<span class="badge ${colorClass}">${businessLine || 'Umum'}</span>`;
}

// Open slide modal (for add)
function openSlideModal() {
    document.getElementById('slideModalTitle').textContent = 'Tambah Slide Baru';
    document.getElementById('slideForm').reset();
    document.getElementById('slideId').value = '';
    document.getElementById('slideBgColor').value = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    document.getElementById('slideStatus').value = 'active';
    document.getElementById('slideOrder').value = '0';
    document.getElementById('slideImagePreview').style.display = 'none';
    document.getElementById('slideModal').style.display = 'flex';
}

// Close slide modal
function closeSlideModal() {
    document.getElementById('slideModal').style.display = 'none';
}

// Close generic modal
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Set background preset
function setBgPreset(preset) {
    document.getElementById('slideBgColor').value = preset;
}

// Preview slide image
function previewSlideImage(input) {
    const preview = document.getElementById('slideImagePreview');
    const bgImageInput = document.getElementById('slideBgImage');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            // Update the URL input with the data URL so it gets saved
            if (bgImageInput) {
                bgImageInput.value = e.target.result;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Edit slide
function editSlide(id) {
    const slides = loadHeroSlides();
    const slide = slides.find(s => s.id === id);
    if (!slide) {
        showToast('Slide tidak ditemukan', 'error');
        return;
    }
    
    document.getElementById('slideModalTitle').textContent = 'Edit Slide';
    document.getElementById('slideId').value = slide.id;
    document.getElementById('slideTitle').value = slide.title;
    document.getElementById('slideDescription').value = slide.description;
    document.getElementById('slideButtonText').value = slide.buttonText;
    document.getElementById('slideButtonLink').value = slide.buttonLink;
    document.getElementById('slideBusinessLine').value = slide.businessLine || 'Umum';
    document.getElementById('slideBgColor').value = slide.bgColor || '';
    document.getElementById('slideBgImage').value = slide.bgImage || '';
    document.getElementById('slideStatus').value = slide.status || 'active';
    document.getElementById('slideOrder').value = slide.order || 0;
    document.getElementById('slideImagePreview').style.display = 'none';
    document.getElementById('slideModal').style.display = 'flex';
}

// View slide details
function viewSlide(id) {
    const slides = loadHeroSlides();
    const slide = slides.find(s => s.id === id);
    if (!slide) {
        showToast('Slide tidak ditemukan', 'error');
        return;
    }
    
    const statusText = slide.status === 'active' ? 'Aktif' : 'Nonaktif';
    const bgPreview = slide.bgImage 
        ? `<img src="${slide.bgImage}" style="width:100%;max-width:400px;border-radius:8px;">`
        : `<div style="width:100%;max-width:400px;height:150px;border-radius:8px;background:${slide.bgColor || '#ccc'};"></div>`;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="padding:10px;">
            ${bgPreview}
            <h3 style="margin-top:15px;">${slide.title}</h3>
            <p>${slide.description}</p>
            <p><strong>Tombol:</strong> ${slide.buttonText} → ${slide.buttonLink}</p>
            <p><strong>Lini Bisnis:</strong> ${slide.businessLine || 'Umum'}</p>
            <p><strong>Status:</strong> ${statusText}</p>
            <p><strong>Urutan:</strong> ${slide.order || 0}</p>
        </div>
    `;
    document.getElementById('modalTitle').textContent = 'Detail Slide';
    document.getElementById('modalOverlay').style.display = 'flex';
}

// Save slide (add or update)
function saveSlide(event) {
    event.preventDefault();
    
    const slides = loadHeroSlides();
    const slideId = document.getElementById('slideId').value;
    
    const slideData = {
        title: document.getElementById('slideTitle').value,
        description: document.getElementById('slideDescription').value,
        buttonText: document.getElementById('slideButtonText').value,
        buttonLink: document.getElementById('slideButtonLink').value,
        businessLine: document.getElementById('slideBusinessLine').value,
        bgColor: document.getElementById('slideBgColor').value,
        bgImage: document.getElementById('slideBgImage').value,
        status: document.getElementById('slideStatus').value,
        order: parseInt(document.getElementById('slideOrder').value) || 0
    };
    
    if (slideId) {
        // Update existing slide
        const index = slides.findIndex(s => s.id === parseInt(slideId));
        if (index !== -1) {
            slides[index] = { ...slides[index], ...slideData };
            showToast('Slide berhasil diperbarui', 'success');
        }
    } else {
        // Add new slide
        const newId = slides.length > 0 ? Math.max(...slides.map(s => s.id)) + 1 : 1;
        slides.push({ id: newId, ...slideData });
        showToast('Slide baru berhasil ditambahkan', 'success');
    }
    
    saveHeroSlides(slides);
    renderSlidesTable();
    closeSlideModal();
}

// Delete slide
function deleteSlide(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus slide ini?')) {
        return;
    }
    
    let slides = loadHeroSlides();
    slides = slides.filter(s => s.id !== id);
    saveHeroSlides(slides);
    renderSlidesTable();
    showToast('Slide berhasil dihapus', 'success');
}

// Initialize slides table on page load
document.addEventListener('DOMContentLoaded', () => {
    renderSlidesTable();
});

// CRUD Operations for Articles
function addArticle() {
    showAddModal('article');
}

function editArticle(id) {
    showEditModal('article', id);
}

function deleteArticle(id) {
    confirmDelete('article', id);
}

// Modal Functions
function showAddModal(type) {
    const modalTitle = type === 'slide' ? 'Tambah Slide Baru' : 'Tambah Artikel Baru';
    showToast(`Form ${modalTitle} akan segera hadir`, 'info');
}

function showEditModal(type, id) {
    const modalTitle = type === 'slide' ? 'Edit Slide' : 'Edit Artikel';
    showToast(`Form ${modalTitle} #${id} akan segera hadir`, 'info');
}

function confirmDelete(type, id) {
    if (confirm(`Apakah Anda yakin ingin menghapus ${type} #${id}?`)) {
        // Simulate deletion
        showToast(`${type} #${id} berhasil dihapus`, 'success');
        
        // Remove from DOM (demo)
        const row = event.target.closest('tr') || event.target.closest('.article-card');
        if (row) {
            row.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => row.remove(), 300);
        }
    }
}

// Message Actions
function markAsRead(messageElement) {
    messageElement.classList.remove('unread');
    showToast('Pesan ditandai sebagai sudah dibaca', 'success');
}

function deleteMessage(messageElement) {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
        messageElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => messageElement.remove(), 300);
        showToast('Pesan berhasil dihapus', 'success');
    }
}

// Reply via WhatsApp
function replyWhatsApp(phone, message) {
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Logout Function
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Clear session
        localStorage.removeItem('admin_session');
        
        // Redirect to login or home page
        showToast('Anda telah logout', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Toast Notification System
function showToast(message, type = 'info') {
    // Create toast container if not exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }
    
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Utility Functions
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
}

function formatDateTime(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('id-ID', options);
}

// Real-time Clock (optional)
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('id-ID');
    }
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock();

// Simulate real-time updates
function simulateRealTimeUpdates() {
    // Simulate new visitor count
    setInterval(() => {
        const visitorStat = document.querySelector('.stat-card:first-child .stat-info h3');
        if (visitorStat) {
            const currentCount = parseInt(visitorStat.textContent.replace(/\D/g, ''));
            const newCount = currentCount + Math.floor(Math.random() * 3);
            visitorStat.textContent = formatNumber(newCount);
        }
    }, 30000); // Update every 30 seconds
}

// Initialize real-time updates
simulateRealTimeUpdates();

// Handle browser back/forward with hash navigation
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showSection(hash);
    }
});

// Check for saved hash on page load
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById('section-' + hash)) {
        showSection(hash);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + D = Dashboard
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        showSection('dashboard');
    }
    // Ctrl + M = Messages
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        showSection('pesan');
    }
    // Escape = Close sidebar on mobile
    if (e.key === 'Escape') {
        sidebar.classList.remove('show');
    }
});

// Print functionality
function printReport() {
    window.print();
}

// Export data (demo)
function exportData(type) {
    showToast(`Export data ${type} akan segera dimulai`, 'info');
    
    // Simulate export
    setTimeout(() => {
        const data = {
            exportDate: new Date().toISOString(),
            type: type,
            records: []
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast(`Data ${type} berhasil diexport`, 'success');
    }, 1000);
}

// Refresh dashboard data
function refreshDashboard() {
    showToast('Memperbarui data dashboard...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        // Update stats with random values
        const stats = {
            visitors: formatNumber(1200 + Math.floor(Math.random() * 100)),
            messages: Math.floor(Math.random() * 50) + 10,
            articles: Math.floor(Math.random() * 20) + 5,
            business: 5
        };
        
        updateStats(stats);
        localStorage.setItem('dashboard_stats', JSON.stringify(stats));
        
        showToast('Data dashboard berhasil diperbarui', 'success');
    }, 1000);
}

// Search functionality
function searchContent(query) {
    if (!query) return;
    
    const results = [];
    const sections = ['dashboard', 'hero', 'bisnis', 'berita', 'kontak', 'pesan', 'pengaturan'];
    
    sections.forEach(section => {
        const element = document.getElementById('section-' + section);
        if (element && element.textContent.toLowerCase().includes(query.toLowerCase())) {
            results.push(section);
        }
    });
    
    if (results.length > 0) {
        showSection(results[0]);
        showToast(`Ditemukan ${results.length} hasil untuk "${query}"`, 'info');
    } else {
        showToast(`Tidak ditemukan hasil untuk "${query}"`, 'warning');
    }
}

// Add search input handler if exists
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchContent(this.value);
        }
    });
}

// Image preview for file uploads
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Character counter for textareas
function setupCharacterCounters() {
    document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
        const counter = document.createElement('span');
        counter.className = 'char-counter';
        counter.style.fontSize = '0.8rem';
        counter.style.color = '#6c757d';
        
        const updateCounter = () => {
            const max = textarea.getAttribute('maxlength');
            const current = textarea.value.length;
            counter.textContent = `${current}/${max} karakter`;
        };
        
        textarea.addEventListener('input', updateCounter);
        textarea.parentNode.appendChild(counter);
        updateCounter();
    });
}

// Initialize character counters
setupCharacterCounters();

// Auto-save draft functionality
function setupAutoSave() {
    let autoSaveTimer;
    
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                const draftData = {};
                form.querySelectorAll('input, textarea, select').forEach(field => {
                    if (field.id || field.name) {
                        draftData[field.id || field.name] = field.value;
                    }
                });
                localStorage.setItem('draft_' + form.className, JSON.stringify(draftData));
            }, 2000);
        });
    });
}

// Initialize auto-save
setupAutoSave();

// Confirmation before leaving page with unsaved changes
let formChanged = false;

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('input', () => {
        formChanged = true;
    });
    
    form.addEventListener('submit', () => {
        formChanged = false;
    });
});

window.addEventListener('beforeunload', function(e) {
    if (formChanged) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// ==========================================
// IMAGE MANAGEMENT FUNCTIONS
// ==========================================

// Preview uploaded image
function previewUploadedImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar!', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            
            // Also update the URL input if exists
            const urlInput = document.getElementById(previewId.replace('Preview', '') + 'ImageUrl');
            if (urlInput) {
                urlInput.value = '';
            }
        };
        reader.readAsDataURL(file);
        showToast('Gambar berhasil dimuat untuk preview', 'info');
    }
}

// Preview from URL
function previewFromUrl(url, previewId) {
    const preview = document.getElementById(previewId);
    if (url && url.trim() !== '') {
        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            showToast('URL tidak valid!', 'error');
            return;
        }
        
        preview.src = url;
        preview.style.display = 'block';
        
        // Clear file input if exists
        const fileInput = document.getElementById(previewId.replace('Preview', '') + 'Image');
        if (fileInput) {
            fileInput.value = '';
        }
        
        showToast('Preview URL dimuat', 'info');
    }
}

// Save image to localStorage
function saveImage(type) {
    const imageData = {};
    
    if (type === 'header') {
        const preview = document.getElementById('headerPreview');
        const urlInput = document.getElementById('headerImageUrl');
        imageData.src = preview.src;
        imageData.url = urlInput ? urlInput.value : '';
        imageData.type = 'header';
    } else if (type === 'footer') {
        const preview = document.getElementById('footerPreview');
        const urlInput = document.getElementById('footerImageUrl');
        const bgPreview = document.getElementById('footerBgPreview');
        imageData.src = preview.src;
        imageData.url = urlInput ? urlInput.value : '';
        imageData.bgSrc = bgPreview ? bgPreview.src : '';
        imageData.type = 'footer';
    } else if (type.startsWith('hero')) {
        const num = type.replace('hero', '');
        const preview = document.getElementById(`hero${num}Preview`);
        const urlInput = document.getElementById(`hero${num}ImageUrl`);
        imageData.src = preview.src;
        imageData.url = urlInput ? urlInput.value : '';
        imageData.type = type;
        imageData.slideNum = num;
    }
    
    // Save to localStorage
    localStorage.setItem(`image_${type}`, JSON.stringify(imageData));
    showToast(`Gambar ${type} berhasil disimpan!`, 'success');
}

// Reset image to default
function resetImage(type) {
    if (!confirm(`Reset gambar ${type} ke default?`)) return;
    
    const defaults = {
        header: 'https://ui-avatars.com/api/?name=EC&background=1e3c72&color=fff&size=150',
        footer: 'https://ui-avatars.com/api/?name=EC&background=1e3c72&color=fff&size=150',
        footerBg: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=150&fit=crop',
        hero1: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=250&fit=crop',
        hero2: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
        hero3: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop',
        hero4: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop',
        hero5: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'
    };
    
    if (type === 'header') {
        document.getElementById('headerPreview').src = defaults.header;
        document.getElementById('headerImageUrl').value = '';
        document.getElementById('headerImage').value = '';
    } else if (type === 'footer') {
        document.getElementById('footerPreview').src = defaults.footer;
        document.getElementById('footerBgPreview').src = defaults.footerBg;
        document.getElementById('footerImageUrl').value = '';
        document.getElementById('footerImage').value = '';
        document.getElementById('footerBgImage').value = '';
    } else if (type.startsWith('hero')) {
        const num = type.replace('hero', '');
        document.getElementById(`hero${num}Preview`).src = defaults[type];
        const urlInput = document.getElementById(`hero${num}ImageUrl`);
        if (urlInput) urlInput.value = '';
        const fileInput = document.getElementById(`hero${num}Image`);
        if (fileInput) fileInput.value = '';
    }
    
    // Remove from localStorage
    localStorage.removeItem(`image_${type}`);
    showToast(`Gambar ${type} berhasil direset ke default!`, 'success');
}

// Save all images
function saveAllImages() {
    const types = ['header', 'footer', 'hero1', 'hero2', 'hero3', 'hero4', 'hero5'];
    types.forEach(type => saveImage(type));
    showToast('Semua gambar berhasil disimpan!', 'success');
}

// Reset all images
function resetAllImages() {
    if (!confirm('Reset semua gambar ke default? Perubahan yang belum disimpan akan hilang.')) return;
    
    const types = ['header', 'footer', 'hero1', 'hero2', 'hero3', 'hero4', 'hero5'];
    types.forEach(type => {
        // Reset without confirmation for each
        const defaults = {
            header: 'https://ui-avatars.com/api/?name=EC&background=1e3c72&color=fff&size=150',
            footer: 'https://ui-avatars.com/api/?name=EC&background=1e3c72&color=fff&size=150',
            footerBg: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=150&fit=crop',
            hero1: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=250&fit=crop',
            hero2: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
            hero3: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop',
            hero4: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop',
            hero5: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'
        };
        
        if (type === 'header') {
            document.getElementById('headerPreview').src = defaults.header;
            document.getElementById('headerImageUrl').value = '';
            document.getElementById('headerImage').value = '';
        } else if (type === 'footer') {
            document.getElementById('footerPreview').src = defaults.footer;
            document.getElementById('footerBgPreview').src = defaults.footerBg;
            document.getElementById('footerImageUrl').value = '';
            document.getElementById('footerImage').value = '';
            document.getElementById('footerBgImage').value = '';
        } else if (type.startsWith('hero')) {
            const num = type.replace('hero', '');
            document.getElementById(`hero${num}Preview`).src = defaults[type];
            const urlInput = document.getElementById(`hero${num}ImageUrl`);
            if (urlInput) urlInput.value = '';
            const fileInput = document.getElementById(`hero${num}Image`);
            if (fileInput) fileInput.value = '';
        }
        
        localStorage.removeItem(`image_${type}`);
    });
    
    showToast('Semua gambar berhasil direset ke default!', 'success');
}

// Preview website
function previewWebsite() {
    window.open('index.html', '_blank');
}

// Load saved images on page load
function loadSavedImages() {
    const types = ['header', 'footer', 'hero1', 'hero2', 'hero3', 'hero4', 'hero5'];
    
    types.forEach(type => {
        const saved = localStorage.getItem(`image_${type}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                if (type === 'header') {
                    if (data.src) document.getElementById('headerPreview').src = data.src;
                    if (data.url) document.getElementById('headerImageUrl').value = data.url;
                } else if (type === 'footer') {
                    if (data.src) document.getElementById('footerPreview').src = data.src;
                    if (data.url) document.getElementById('footerImageUrl').value = data.url;
                    if (data.bgSrc) document.getElementById('footerBgPreview').src = data.bgSrc;
                } else if (type.startsWith('hero')) {
                    const num = type.replace('hero', '');
                    if (data.src) document.getElementById(`hero${num}Preview`).src = data.src;
                    if (data.url) document.getElementById(`hero${num}ImageUrl`).value = data.url;
                }
            } catch (e) {
                console.error(`Error loading image ${type}:`, e);
            }
        }
    });
}

// ============================================
// PAGE IMAGES MANAGEMENT (Gambar Halaman)
// ============================================

// Show page tab
function showPageTab(tabName, event) {
    // Hide all tab contents
    document.querySelectorAll('.page-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all tab buttons
    document.querySelectorAll('.page-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const pageElement = document.getElementById(`page-${tabName}`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Set active button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// ============================================
// PAGE LOGO MANAGEMENT
// ============================================

// Preview page logo from file upload
function previewPageLogo(input, previewId) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file terlalu besar! Maksimal 2MB', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar!', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
            showToast('Preview logo berhasil dimuat', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Preview page logo from URL
function previewPageLogoFromUrl(url, previewId) {
    if (url && url.trim() !== '') {
        const img = document.getElementById(previewId);
        img.src = url;
        
        img.onerror = function() {
            showToast('URL logo tidak valid!', 'error');
        };
        
        img.onload = function() {
            showToast('Preview logo dari URL berhasil', 'success');
        };
    }
}

// Save page logo to localStorage
function savePageLogo(page) {
    const previewId = `${page}LogoPreview`;
    const urlInputId = `${page}LogoUrl`;
    
    const imgElement = document.getElementById(previewId);
    const urlInput = document.getElementById(urlInputId);
    
    if (!imgElement) {
        showToast('Element logo tidak ditemukan!', 'error');
        return;
    }
    
    const logoData = {
        page: page,
        src: imgElement.src,
        url: urlInput ? urlInput.value : '',
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`pageLogo_${page}`, JSON.stringify(logoData));
    showToast(`Logo untuk halaman ${page} berhasil disimpan!`, 'success');
}

// Reset page logo to default
function resetPageLogo(page) {
    if (!confirm(`Apakah Anda yakin ingin mereset logo halaman ${page} ke default?`)) {
        return;
    }
    
    // Remove from localStorage
    localStorage.removeItem(`pageLogo_${page}`);
    
    // Set default logo based on page
    const defaultLogos = {
        'hijab': 'https://ui-avatars.com/api/?name=Hijab&background=8B4557&color=fff&size=150',
        'sembako': 'https://ui-avatars.com/api/?name=Sembako&background=2E7D32&color=fff&size=150',
        'travel': 'https://ui-avatars.com/api/?name=Travel&background=0277BD&color=fff&size=150',
        'design': 'https://ui-avatars.com/api/?name=Design&background=5D4037&color=fff&size=150',
        'management': 'https://ui-avatars.com/api/?name=Management&background=1565C0&color=fff&size=150'
    };
    
    const previewId = `${page}LogoPreview`;
    const urlInputId = `${page}LogoUrl`;
    const fileInputId = `${page}LogoImage`;
    
    const imgElement = document.getElementById(previewId);
    const urlInput = document.getElementById(urlInputId);
    const fileInput = document.getElementById(fileInputId);
    
    if (imgElement && defaultLogos[page]) {
        imgElement.src = defaultLogos[page];
    }
    
    if (urlInput) {
        urlInput.value = '';
    }
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    showToast(`Logo halaman ${page} berhasil direset ke default!`, 'success');
}

// Load page logo from localStorage
function loadPageLogo(page) {
    const saved = localStorage.getItem(`pageLogo_${page}`);
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            const previewId = `${page}LogoPreview`;
            const urlInputId = `${page}LogoUrl`;
            
            const imgElement = document.getElementById(previewId);
            const urlInput = document.getElementById(urlInputId);
            
            if (imgElement && data.src) {
                imgElement.src = data.src;
            }
            
            if (urlInput && data.url) {
                urlInput.value = data.url;
            }
        } catch (e) {
            console.error(`Error loading page logo ${page}:`, e);
        }
    }
}

// Load all page logos
function loadAllPageLogos() {
    const pages = ['hijab', 'sembako', 'travel', 'design', 'management'];
    pages.forEach(page => {
        loadPageLogo(page);
    });
}

// Preview page image from file upload
function previewPageImage(input, previewId) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file terlalu besar! Maksimal 2MB', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar!', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
            showToast('Preview gambar berhasil dimuat', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Preview page image from URL
function previewPageImageFromUrl(url, previewId) {
    if (url && url.trim() !== '') {
        const img = document.getElementById(previewId);
        img.src = url;
        
        img.onerror = function() {
            showToast('URL gambar tidak valid!', 'error');
        };
        
        img.onload = function() {
            showToast('Preview gambar dari URL berhasil', 'success');
        };
    }
}

// Save page image (deprecated - hero removed)
function savePageImage(page, type) {
    // Hero image has been removed from page images section
    showToast('Fitur hero image telah dihapus dari Gambar Halaman', 'warning');
}

// Save page gallery
function savePageGallery(page) {
    const galleryData = {
        page: page,
        images: [],
        savedAt: new Date().toISOString()
    };
    
    // Determine prefix based on page
    let prefix = '';
    let count = 6;
    
    switch(page) {
        case 'hijab':
            prefix = 'hijabProduct';
            break;
        case 'sembako':
            prefix = 'sembakoProduct';
            break;
        case 'travel':
            prefix = 'travelDest';
            break;
        case 'design':
            prefix = 'designPort';
            break;
        case 'management':
            prefix = 'managementServ';
            break;
    }
    
    // Collect all gallery images
    for (let i = 1; i <= count; i++) {
        const imgElement = document.getElementById(`${prefix}${i}Preview`);
        const urlInput = document.getElementById(`${prefix}${i}Url`);
        
        if (imgElement) {
            galleryData.images.push({
                index: i,
                src: imgElement.src,
                url: urlInput ? urlInput.value : ''
            });
        }
    }
    
    localStorage.setItem(`pageGallery_${page}`, JSON.stringify(galleryData));
    showToast(`Galeri untuk halaman ${page} berhasil disimpan!`, 'success');
}

// Save page testimonials
function savePageTestimonials(page) {
    const testiData = {
        page: page,
        images: [],
        savedAt: new Date().toISOString()
    };
    
    // Collect testimonial images
    for (let i = 1; i <= 3; i++) {
        const imgElement = document.getElementById(`${page}Testi${i}Preview`);
        const urlInput = document.getElementById(`${page}Testi${i}Url`);
        
        if (imgElement) {
            testiData.images.push({
                index: i,
                src: imgElement.src,
                url: urlInput ? urlInput.value : ''
            });
        }
    }
    
    localStorage.setItem(`pageTestimonials_${page}`, JSON.stringify(testiData));
    showToast(`Testimoni untuk halaman ${page} berhasil disimpan!`, 'success');
}

// Save all page images
function saveAllPageImages() {
    const pages = ['hijab', 'sembako', 'travel', 'design', 'management'];
    
    pages.forEach(page => {
        // Save logo
        savePageLogo(page);
        
        // Save gallery
        savePageGallery(page);
        
        // Save testimonials (only for hijab)
        if (page === 'hijab') {
            savePageTestimonials(page);
        }
    });
    
    showToast('Semua gambar halaman berhasil disimpan!', 'success');
}

// Reset all page images to default
function resetAllPageImages() {
    if (!confirm('Apakah Anda yakin ingin mereset semua gambar halaman ke default?')) {
        return;
    }
    
    const pages = ['hijab', 'sembako', 'travel', 'design', 'management'];
    
    pages.forEach(page => {
        // Remove from localStorage
        localStorage.removeItem(`pageLogo_${page}`);
        localStorage.removeItem(`pageGallery_${page}`);
        localStorage.removeItem(`pageTestimonials_${page}`);
    });
    
    showToast('Semua gambar halaman berhasil direset ke default!', 'success');
    
    // Reload page to show defaults
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Load all saved page images
function loadAllPageImages() {
    const pages = ['hijab', 'sembako', 'travel', 'design', 'management'];
    
    pages.forEach(page => {
        // Load logo
        loadPageLogo(page);
        
        // Load gallery
        loadPageGallery(page);
        
        // Load testimonials
        loadPageTestimonials(page);
    });
    
    showToast('Gambar tersimpan berhasil dimuat!', 'success');
}

// Load single page image (deprecated - hero removed)
function loadPageImage(page, type) {
    // Hero image has been removed from page images section
    // This function is kept for backward compatibility
}

// Load page gallery
function loadPageGallery(page) {
    const saved = localStorage.getItem(`pageGallery_${page}`);
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            let prefix = '';
            switch(page) {
                case 'hijab':
                    prefix = 'hijabProduct';
                    break;
                case 'sembako':
                    prefix = 'sembakoProduct';
                    break;
                case 'travel':
                    prefix = 'travelDest';
                    break;
                case 'design':
                    prefix = 'designPort';
                    break;
                case 'management':
                    prefix = 'managementServ';
                    break;
            }
            
            data.images.forEach(img => {
                const imgElement = document.getElementById(`${prefix}${img.index}Preview`);
                const urlInput = document.getElementById(`${prefix}${img.index}Url`);
                
                if (imgElement && img.src) {
                    imgElement.src = img.src;
                }
                if (urlInput && img.url) {
                    urlInput.value = img.url;
                }
            });
        } catch (e) {
            console.error(`Error loading page gallery ${page}:`, e);
        }
    }
}

// Load page testimonials
function loadPageTestimonials(page) {
    const saved = localStorage.getItem(`pageTestimonials_${page}`);
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            data.images.forEach(img => {
                const imgElement = document.getElementById(`${page}Testi${img.index}Preview`);
                const urlInput = document.getElementById(`${page}Testi${img.index}Url`);
                
                if (imgElement && img.src) {
                    imgElement.src = img.src;
                }
                if (urlInput && img.url) {
                    urlInput.value = img.url;
                }
            });
        } catch (e) {
            console.error(`Error loading page testimonials ${page}:`, e);
        }
    }
}

// ============================================
// MANAGEMENT PAGE SPECIFIC FUNCTIONS
// ============================================

// Default SVG logo for Management hero section
const defaultManagementHeroLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 100 100'%3E%3Cpath d='M15 85 V25 C15 25, 35 55, 50 55 C65 55, 85 25, 85 25 V85' fill='none' stroke='%232563eb' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M25 45 C35 25, 65 25, 75 45 C65 65, 35 65, 25 45 Z' fill='none' stroke='%2338bdf8' stroke-width='8' stroke-linecap='round'/%3E%3C/svg%3E";

// Preview Management hero logo from file upload
function previewManagementHeroLogo(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file terlalu besar! Maksimal 2MB', 'error');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar!', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('managementHeroLogoPreview').src = e.target.result;
            showToast('Preview logo hero berhasil dimuat', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Preview Management hero logo from URL
function previewManagementHeroLogoFromUrl(url) {
    if (url && url.trim() !== '') {
        const img = document.getElementById('managementHeroLogoPreview');
        img.src = url;
        
        img.onerror = function() {
            showToast('URL logo tidak valid!', 'error');
        };
        
        img.onload = function() {
            showToast('Preview logo hero dari URL berhasil', 'success');
        };
    }
}

// Save Management hero logo to localStorage
function saveManagementHeroLogo() {
    const imgElement = document.getElementById('managementHeroLogoPreview');
    const urlInput = document.getElementById('managementHeroLogoUrl');
    
    if (!imgElement) {
        showToast('Element logo hero tidak ditemukan!', 'error');
        return;
    }
    
    const logoData = {
        src: imgElement.src,
        url: urlInput ? urlInput.value : '',
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('managementHeroLogo', JSON.stringify(logoData));
    showToast('Logo hero Management berhasil disimpan!', 'success');
}

// Reset Management hero logo to default
function resetManagementHeroLogo() {
    if (!confirm('Apakah Anda yakin ingin mereset logo hero ke default?')) {
        return;
    }
    
    // Remove from localStorage
    localStorage.removeItem('managementHeroLogo');
    
    // Set default SVG logo
    document.getElementById('managementHeroLogoPreview').src = defaultManagementHeroLogo;
    document.getElementById('managementHeroLogoUrl').value = '';
    document.getElementById('managementHeroLogoImage').value = '';
    
    showToast('Logo hero Management berhasil direset ke default!', 'success');
}

// Load Management hero logo from localStorage
function loadManagementHeroLogo() {
    const saved = localStorage.getItem('managementHeroLogo');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            if (data.src) {
                document.getElementById('managementHeroLogoPreview').src = data.src;
            }
            if (data.url) {
                document.getElementById('managementHeroLogoUrl').value = data.url;
            }
        } catch (e) {
            console.error('Error loading management hero logo:', e);
        }
    }
}

// Update Management icon preview
function updateManagementIconPreview(num, iconClass) {
    const previewElement = document.getElementById(`managementIcon${num}Preview`);
    if (previewElement) {
        const colors = ['#3b82f6', '#38bdf8', '#6366f1'];
        previewElement.innerHTML = `<i class="fa-solid ${iconClass}" style="font-size: 2rem; color: ${colors[num-1]};"></i>`;
    }
}

// Save Management main service icons
function saveManagementIcons() {
    const iconsData = {
        icon1: document.getElementById('managementIcon1').value,
        icon2: document.getElementById('managementIcon2').value,
        icon3: document.getElementById('managementIcon3').value,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('managementIcons', JSON.stringify(iconsData));
    showToast('Ikon Tugas Utama Management berhasil disimpan!', 'success');
}

// Load Management main service icons
function loadManagementIcons() {
    const saved = localStorage.getItem('managementIcons');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            if (data.icon1) {
                document.getElementById('managementIcon1').value = data.icon1;
                updateManagementIconPreview(1, data.icon1);
            }
            if (data.icon2) {
                document.getElementById('managementIcon2').value = data.icon2;
                updateManagementIconPreview(2, data.icon2);
            }
            if (data.icon3) {
                document.getElementById('managementIcon3').value = data.icon3;
                updateManagementIconPreview(3, data.icon3);
            }
        } catch (e) {
            console.error('Error loading management icons:', e);
        }
    }
}

// Save Management workflow steps
function saveManagementSteps() {
    const stepsData = {
        step1: document.getElementById('managementStep1Title').value,
        step2: document.getElementById('managementStep2Title').value,
        step3: document.getElementById('managementStep3Title').value,
        step4: document.getElementById('managementStep4Title').value,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('managementSteps', JSON.stringify(stepsData));
    showToast('Alur Kerja Management berhasil disimpan!', 'success');
}

// Load Management workflow steps
function loadManagementSteps() {
    const saved = localStorage.getItem('managementSteps');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            if (data.step1) document.getElementById('managementStep1Title').value = data.step1;
            if (data.step2) document.getElementById('managementStep2Title').value = data.step2;
            if (data.step3) document.getElementById('managementStep3Title').value = data.step3;
            if (data.step4) document.getElementById('managementStep4Title').value = data.step4;
        } catch (e) {
            console.error('Error loading management steps:', e);
        }
    }
}

// Save Management advantage icons
function saveManagementAdvIcons() {
    const advIconsData = {
        icon1: document.getElementById('managementAdvIcon1').value,
        icon2: document.getElementById('managementAdvIcon2').value,
        icon3: document.getElementById('managementAdvIcon3').value,
        icon4: document.getElementById('managementAdvIcon4').value,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('managementAdvIcons', JSON.stringify(advIconsData));
    showToast('Ikon Keunggulan Management berhasil disimpan!', 'success');
}

// Load Management advantage icons
function loadManagementAdvIcons() {
    const saved = localStorage.getItem('managementAdvIcons');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            if (data.icon1) document.getElementById('managementAdvIcon1').value = data.icon1;
            if (data.icon2) document.getElementById('managementAdvIcon2').value = data.icon2;
            if (data.icon3) document.getElementById('managementAdvIcon3').value = data.icon3;
            if (data.icon4) document.getElementById('managementAdvIcon4').value = data.icon4;
        } catch (e) {
            console.error('Error loading management advantage icons:', e);
        }
    }
}

// Load all Management specific data
function loadAllManagementData() {
    loadManagementHeroLogo();
    loadManagementIcons();
    loadManagementSteps();
    loadManagementAdvIcons();
}

// ==========================================
// GAMBAR HALAMAN (PAGE IMAGES) FUNCTIONS
// ==========================================

// Show page tab for image management
function showPageTab(pageName) {
    // Remove active class from all tabs
    document.querySelectorAll('.page-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    event.target.closest('.page-tab-btn').classList.add('active');
    document.getElementById('page-tab-' + pageName).classList.add('active');
}

// Show add image modal
function showAddImageModal() {
    const modalBody = `
        <form id="addImageForm">
            <div class="form-group">
                <label>Pilih Halaman</label>
                <select id="imagePage" required>
                    <option value="">-- Pilih Halaman --</option>
                    <option value="index">Beranda</option>
                    <option value="hijab">Hijab</option>
                    <option value="sembako">Kedai Sembako</option>
                    <option value="travel">Travel Agent</option>
                    <option value="design">Design Interior</option>
                    <option value="management">Management</option>
                </select>
            </div>
            <div class="form-group">
                <label>Jenis Gambar</label>
                <select id="imageType" required>
                    <option value="">-- Pilih Jenis --</option>
                    <option value="banner">Banner</option>
                    <option value="gallery">Gallery</option>
                    <option value="section">Section</option>
                </select>
            </div>
            <div class="form-group">
                <label>Judul Gambar</label>
                <input type="text" id="imageTitle" placeholder="Masukkan judul gambar" required>
            </div>
            <div class="form-group">
                <label>Upload Gambar</label>
                <input type="file" id="imageFile" accept="image/*" onchange="previewNewImage(this)">
            </div>
            <div class="form-group">
                <label>Atau URL Gambar</label>
                <input type="url" id="imageUrl" placeholder="https://...">
            </div>
            <div class="image-preview-container" id="newImagePreview" style="display: none;">
                <img id="newImagePreviewImg" src="" alt="Preview">
            </div>
        </form>
    `;
    
    openModal('Tambah Gambar Baru', modalBody);
    document.getElementById('modalConfirmBtn').onclick = saveNewImage;
}

// Preview new image before upload
function previewNewImage(input) {
    const preview = document.getElementById('newImagePreview');
    const previewImg = document.getElementById('newImagePreviewImg');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Save new image
function saveNewImage() {
    const page = document.getElementById('imagePage').value;
    const type = document.getElementById('imageType').value;
    const title = document.getElementById('imageTitle').value;
    const url = document.getElementById('imageUrl').value;
    const file = document.getElementById('imageFile').files[0];
    
    if (!page || !type || !title) {
        showToast('Mohon lengkapi semua field yang wajib diisi!', 'error');
        return;
    }
    
    if (!url && !file) {
        showToast('Mohon upload gambar atau masukkan URL gambar!', 'error');
        return;
    }
    
    // Simulate saving
    showToast('Gambar berhasil ditambahkan!', 'success');
    closeModal();
}

// Preview image from file input
function previewImage(input, targetId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = input.closest('.hero-image-item, .page-image-card, .page-gallery-item').querySelector('img');
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Save gallery image
function saveGalleryImage(pageName, imageIndex) {
    const galleryItem = event.target.closest('.page-gallery-item');
    const fileInput = galleryItem.querySelector('input[type="file"]');
    
    if (fileInput.files && fileInput.files[0]) {
        showToast(`Gambar gallery ${pageName} #${imageIndex} berhasil diupdate!`, 'success');
    } else {
        showToast('Mohon pilih gambar baru!', 'error');
    }
}

// Reset page images to default
function resetPageImages() {
    if (confirm('Apakah Anda yakin ingin mereset semua gambar ke default?')) {
        // Clear localStorage image data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('Image') || key.includes('image')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        showToast('Gambar berhasil direset ke default!', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

// Console welcome message
console.log('%c Elyasya Corp Admin Dashboard ', 'background: #1e3c72; color: white; font-size: 16px; padding: 10px;');
console.log('Dashboard initialized successfully!');
