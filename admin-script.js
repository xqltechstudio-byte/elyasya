// ==========================================
// ELYASYA CORP ADMIN PANEL - MAIN SCRIPT
// ==========================================

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const ADMIN_CONFIG = {
    // Keys must match admin.html
    accountKey: 'adminAccount',
    sessionKey: 'adminSession',
    storageKeys: {
        heroSlides: 'heroSlides',
        pageImage: 'pageImage_',
        pageGallery: 'pageGallery_',
        pageTestimonials: 'pageTestimonials_'
    },
    pages: ['hijab', 'sembako', 'travel', 'design', 'management']
};

// ==========================================
// AUTHENTICATION MODULE
// ==========================================

const Auth = {
    // Initialize default admin account if not exist (matches admin.html)
    initUsers() {
        if (!localStorage.getItem(ADMIN_CONFIG.accountKey)) {
            const defaultAdmin = {
                username: 'admin',
                passwordHash: btoa('admin123'),
                name: 'Administrator'
            };
            localStorage.setItem(ADMIN_CONFIG.accountKey, JSON.stringify(defaultAdmin));
        }
    },

    // Login function (compatible with admin.html)
    login(username, password, rememberMe = false) {
        this.initUsers();
        const adminData = JSON.parse(localStorage.getItem(ADMIN_CONFIG.accountKey) || '{}');
        
        if (username === adminData.username && btoa(password) === adminData.passwordHash) {
            const session = {
                username: adminData.username,
                name: adminData.name,
                loginTime: Date.now(),
                rememberMe: rememberMe
            };
            
            localStorage.setItem(ADMIN_CONFIG.sessionKey, JSON.stringify(session));
            return { success: true, user: session };
        }
        
        return { success: false, message: 'Username atau password salah!' };
    },

    // Logout function
    logout() {
        localStorage.removeItem(ADMIN_CONFIG.sessionKey);
        sessionStorage.removeItem(ADMIN_CONFIG.sessionKey);
        window.location.href = 'admin.html';
    },

    // Check if user is logged in
    isLoggedIn() {
        const session = this.getSession();
        return session !== null;
    },

    // Get current session
    getSession() {
        let session = localStorage.getItem(ADMIN_CONFIG.sessionKey);
        if (!session) {
            session = sessionStorage.getItem(ADMIN_CONFIG.sessionKey);
        }
        return session ? JSON.parse(session) : null;
    },

    // Require authentication
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'admin.html';
            return false;
        }
        return true;
    }
};

// ==========================================
// INDEXEDDB STORAGE MODULE (Replaces localStorage for large data)
// ==========================================

const DB_NAME = 'ElyasyaAdminDB';
const DB_VERSION = 1;
const STORE_NAME = 'adminData';

const IndexedDB = {
    db: null,

    // Open database
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

    // Get data
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

    // Set data
    async set(key, value) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(value, key);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    // Remove data
    async remove(key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(key);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    // Get all keys
    async getAllKeys() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Clear all data
    async clear() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
};

// ==========================================
// DATA STORAGE MODULE (Uses IndexedDB)
// ==========================================

const DataStore = {
    // Get data from IndexedDB
    async get(key, defaultValue = null) {
        try {
            const data = await IndexedDB.get(key);
            if (data !== undefined && data !== null) {
                return data;
            }
            // Fallback to localStorage for backward compatibility
            const localData = localStorage.getItem(key);
            if (localData) {
                try {
                    return JSON.parse(localData);
                } catch (e) {
                    return defaultValue;
                }
            }
            return defaultValue;
        } catch (e) {
            console.error('Error getting data:', e);
            return defaultValue;
        }
    },

    // Set data to IndexedDB with error handling
    async set(key, value) {
        try {
            await IndexedDB.set(key, value);
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            showToast('Gagal menyimpan data: ' + e.message, 'error');
            return false;
        }
    },

    // Remove data from IndexedDB
    async remove(key) {
        try {
            await IndexedDB.remove(key);
            // Also remove from localStorage if exists
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing data:', e);
            return false;
        }
    },

    // Get all keys matching a pattern
    async getKeysByPattern(pattern) {
        try {
            const keys = await IndexedDB.getAllKeys();
            return keys.filter(key => key.startsWith(pattern));
        } catch (e) {
            // Fallback to localStorage
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(pattern)) {
                    keys.push(key);
                }
            }
            return keys;
        }
    },

    // Migrate existing localStorage data to IndexedDB (only if not exists in IndexedDB)
    async migrateFromLocalStorage() {
        try {
            const keysToMigrate = [
                'heroSlides',
                ...ADMIN_CONFIG.pages.map(p => `pageImage_${p}`),
                ...ADMIN_CONFIG.pages.map(p => `pageGallery_${p}`),
                ...ADMIN_CONFIG.pages.map(p => `pageTestimonials_${p}`)
            ];
            
            for (const key of keysToMigrate) {
                const localData = localStorage.getItem(key);
                if (localData) {
                    try {
                        // Only migrate if data doesn't exist in IndexedDB yet
                        const existingData = await IndexedDB.get(key);
                        if (existingData === undefined || existingData === null) {
                            const parsed = JSON.parse(localData);
                            await IndexedDB.set(key, parsed);
                            console.log(`Migrated ${key} to IndexedDB`);
                        } else {
                            console.log(`${key} already exists in IndexedDB, skipping migration`);
                        }
                        // Remove from localStorage after check (whether migrated or not)
                        localStorage.removeItem(key);
                        console.log(`Removed ${key} from localStorage`);
                    } catch (e) {
                        console.error(`Failed to migrate ${key}:`, e);
                    }
                }
            }
            console.log('Migration check complete!');
        } catch (e) {
            console.error('Migration error:', e);
        }
    },

    // Get storage usage info
    async getStorageInfo() {
        try {
            const keys = await IndexedDB.getAllKeys();
            let totalSize = 0;
            const details = [];
            
            for (const key of keys) {
                const data = await IndexedDB.get(key);
                const size = JSON.stringify(data).length;
                totalSize += size;
                details.push({ key, size: (size / 1024).toFixed(2) + ' KB' });
            }
            
            return {
                totalSize: (totalSize / 1024 / 1024).toFixed(2) + ' MB',
                itemCount: keys.length,
                details
            };
        } catch (e) {
            return { error: e.message };
        }
    }
};

// ==========================================
// HERO SLIDES MANAGEMENT (Async for IndexedDB)
// ==========================================

const HeroSlides = {
    // Default slides
    defaultSlides: [
        {
            id: 1,
            title: 'Elyasya Corp',
            description: 'Holding Company dengan 5 Lini Bisnis Terpercaya',
            buttonText: 'Jelajahi Bisnis Kami',
            buttonLink: '#bisnis',
            businessLine: 'Umum',
            bgColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            bgImage: '',
            imageBase64: '',
            status: 'active'
        },
        {
            id: 2,
            title: 'Innovative Solutions',
            description: 'Fashion | Travel | Food | Management | Design',
            buttonText: 'Lihat Layanan',
            buttonLink: '#bisnis',
            businessLine: 'Umum',
            bgColor: 'linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)',
            bgImage: '',
            imageBase64: '',
            status: 'active'
        }
    ],

    // Cache for synchronous access
    _cache: null,

    // Initialize cache
    async init() {
        console.log('🔄 Initializing HeroSlides...');
        
        // First, try to get from IndexedDB directly
        const indexedData = await IndexedDB.get(ADMIN_CONFIG.storageKeys.heroSlides);
        console.log('📦 Data from IndexedDB:', indexedData ? `${indexedData.length} slides` : 'null/undefined');
        
        if (indexedData !== undefined && indexedData !== null && Array.isArray(indexedData)) {
            this._cache = indexedData;
            console.log('✅ Loaded from IndexedDB:', this._cache.length, 'slides');
            // Log first slide's image for debugging
            if (this._cache.length > 0 && this._cache[0].imageBase64) {
                console.log('🖼️ First slide has image:', this._cache[0].imageBase64.substring(0, 50) + '...');
            }
            return this._cache;
        }
        
        // Fallback to DataStore (which checks localStorage)
        this._cache = await DataStore.get(ADMIN_CONFIG.storageKeys.heroSlides, this.defaultSlides);
        console.log('📦 Loaded from DataStore fallback:', this._cache.length, 'slides');
        return this._cache;
    },

    // Get all slides (sync from cache)
    getAll() {
        return this._cache || this.defaultSlides;
    },

    // Get slide by ID (sync from cache)
    getById(id) {
        const slides = this.getAll();
        return slides.find(s => s.id === id) || null;
    },

    // Save all slides
    async saveAll(slides) {
        this._cache = slides;
        console.log('💾 Saving slides to IndexedDB:', slides.length, 'slides');
        const result = await DataStore.set(ADMIN_CONFIG.storageKeys.heroSlides, slides);
        console.log('✅ Save result:', result);
        
        // Verify data was saved by reading it back
        const verify = await IndexedDB.get(ADMIN_CONFIG.storageKeys.heroSlides);
        console.log('🔍 Verification - data in IndexedDB:', verify ? verify.length : 0, 'slides');
        
        // Also save to localStorage to trigger storage event for cross-tab sync
        try {
            localStorage.setItem(ADMIN_CONFIG.storageKeys.heroSlides, JSON.stringify(slides));
            console.log('📢 Also saved to localStorage for cross-tab sync');
        } catch (e) {
            console.warn('⚠️ Could not save to localStorage (quota exceeded?):', e.message);
        }
        
        return result;
    },

    // Add new slide
    async add(slide) {
        const slides = this.getAll();
        slide.id = Date.now();
        slide.status = slide.status || 'active';
        slides.push(slide);
        return await this.saveAll(slides);
    },

    // Update slide
    async update(id, updates) {
        const slides = this.getAll();
        const index = slides.findIndex(s => s.id === id);
        if (index !== -1) {
            slides[index] = { ...slides[index], ...updates };
            return await this.saveAll(slides);
        }
        return false;
    },

    // Delete slide
    async delete(id) {
        let slides = this.getAll();
        slides = slides.filter(s => s.id !== id);
        return await this.saveAll(slides);
    }
};

// ==========================================
// PAGE IMAGES MANAGEMENT (Async with cache)
// ==========================================

const PageImages = {
    _cache: {},

    async init() {
        for (const page of ADMIN_CONFIG.pages) {
            for (const type of ['hero', 'about']) {
                const key = `${ADMIN_CONFIG.storageKeys.pageImage}${page}_${type}`;
                this._cache[key] = await DataStore.get(key, null);
            }
        }
    },

    get(page, type) {
        const key = `${ADMIN_CONFIG.storageKeys.pageImage}${page}_${type}`;
        return this._cache[key] || null;
    },

    async save(page, type, imageData) {
        const key = `${ADMIN_CONFIG.storageKeys.pageImage}${page}_${type}`;
        this._cache[key] = imageData;
        return await DataStore.set(key, imageData);
    },

    async remove(page, type) {
        const key = `${ADMIN_CONFIG.storageKeys.pageImage}${page}_${type}`;
        this._cache[key] = null;
        await DataStore.remove(key);
    },

    getAllForPage(page) {
        return {
            hero: this.get(page, 'hero'),
            about: this.get(page, 'about')
        };
    }
};

// ==========================================
// GALLERY MANAGEMENT (Async with cache)
// ==========================================

const Gallery = {
    _cache: {},

    async init() {
        for (const page of ADMIN_CONFIG.pages) {
            const key = `${ADMIN_CONFIG.storageKeys.pageGallery}${page}`;
            this._cache[key] = await DataStore.get(key, { images: [] });
        }
    },

    get(page) {
        const key = `${ADMIN_CONFIG.storageKeys.pageGallery}${page}`;
        return this._cache[key] || { images: [] };
    },

    async save(page, images) {
        const key = `${ADMIN_CONFIG.storageKeys.pageGallery}${page}`;
        this._cache[key] = { images: images };
        return await DataStore.set(key, { images: images });
    },

    async addImage(page, imageData) {
        const gallery = this.get(page);
        gallery.images.push({
            id: Date.now(),
            ...imageData
        });
        return await this.save(page, gallery.images);
    },

    async removeImage(page, imageId) {
        const gallery = this.get(page);
        gallery.images = gallery.images.filter(img => img.id !== imageId);
        return await this.save(page, gallery.images);
    },

    async updateImage(page, imageId, updates) {
        const gallery = this.get(page);
        const index = gallery.images.findIndex(img => img.id === imageId);
        if (index !== -1) {
            gallery.images[index] = { ...gallery.images[index], ...updates };
            return await this.save(page, gallery.images);
        }
        return false;
    }
};

// ==========================================
// TESTIMONIALS MANAGEMENT (Async with cache)
// ==========================================

const Testimonials = {
    _cache: {},

    async init() {
        for (const page of ADMIN_CONFIG.pages) {
            const key = `${ADMIN_CONFIG.storageKeys.pageTestimonials}${page}`;
            this._cache[key] = await DataStore.get(key, { images: [] });
        }
    },

    get(page) {
        const key = `${ADMIN_CONFIG.storageKeys.pageTestimonials}${page}`;
        return this._cache[key] || { images: [] };
    },

    async save(page, testimonials) {
        const key = `${ADMIN_CONFIG.storageKeys.pageTestimonials}${page}`;
        this._cache[key] = { images: testimonials };
        return await DataStore.set(key, { images: testimonials });
    },

    async add(page, testimonial) {
        const data = this.get(page);
        data.images.push({
            id: Date.now(),
            ...testimonial
        });
        return await this.save(page, data.images);
    },

    async remove(page, id) {
        const data = this.get(page);
        data.images = data.images.filter(t => t.id !== id);
        return await this.save(page, data.images);
    }
};

// ==========================================
// UI UTILITIES
// ==========================================

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="icon">${icons[type] || icons.info}</span>
        <span class="message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show modal
function showModal(title, body, footer = '') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer;
    document.getElementById('modalOverlay').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Close modal on overlay click
function closeModalOnOverlay(event) {
    if (event.target === event.currentTarget) {
        closeModal();
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Toggle user menu (placeholder)
function toggleUserMenu() {
    // Could implement a dropdown menu here
}

// Handle logout
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        Auth.logout();
    }
}

// Convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// NAVIGATION & PAGE RENDERING
// ==========================================

let currentPage = 'dashboard';

// Navigate to page
function navigateTo(page) {
    currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Update page title
    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Ringkasan data dan statistik website' },
        'hero-slider': { title: 'Hero Slider', subtitle: 'Kelola slider di halaman utama' },
        'page-images': { title: 'Page Images', subtitle: 'Kelola gambar hero dan about per halaman' },
        'galleries': { title: 'Galleries', subtitle: 'Kelola galeri foto per halaman bisnis' },
        'testimonials': { title: 'Testimonials', subtitle: 'Kelola testimonial pelanggan' },
        'hijab': { title: 'Elyasya Hijab', subtitle: 'Kelola konten halaman Hijab' },
        'sembako': { title: 'Kedai Sembako', subtitle: 'Kelola konten halaman Sembako' },
        'travel': { title: 'Travel', subtitle: 'Kelola konten halaman Travel' },
        'design': { title: 'Design Interior', subtitle: 'Kelola konten halaman Design Interior' },
        'management': { title: 'Management', subtitle: 'Kelola konten halaman Management' },
        'settings': { title: 'Settings', subtitle: 'Pengaturan admin panel' }
    };

    const pageInfo = titles[page] || { title: 'Page', subtitle: '' };
    document.getElementById('pageTitle').textContent = pageInfo.title;
    document.getElementById('pageSubtitle').textContent = pageInfo.subtitle;

    // Render page content
    renderPage(page);

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('active');
}

// Render page content
function renderPage(page) {
    const contentArea = document.getElementById('contentArea');
    
    switch(page) {
        case 'dashboard':
            contentArea.innerHTML = renderDashboard();
            break;
        case 'hero-slider':
            contentArea.innerHTML = renderHeroSliderPage();
            initHeroSliderPage();
            break;
        case 'page-images':
            contentArea.innerHTML = renderPageImagesPage();
            initPageImagesPage();
            break;
        case 'galleries':
            contentArea.innerHTML = renderGalleriesPage();
            initGalleriesPage();
            break;
        case 'testimonials':
            contentArea.innerHTML = renderTestimonialsPage();
            initTestimonialsPage();
            break;
        case 'hijab':
        case 'sembako':
        case 'travel':
        case 'design':
        case 'management':
            contentArea.innerHTML = renderBusinessPage(page);
            initBusinessPage(page);
            break;
        case 'settings':
            contentArea.innerHTML = renderSettingsPage();
            initSettingsPage();
            break;
        default:
            contentArea.innerHTML = '<p>Page not found</p>';
    }
}

// ==========================================
// DASHBOARD PAGE
// ==========================================

function renderDashboard() {
    const session = Auth.getSession();
    const slides = HeroSlides.getAll();
    const activeSlides = slides.filter(s => s.status === 'active').length;
    
    // Count images and galleries
    let totalImages = 0;
    let totalGalleries = 0;
    
    ADMIN_CONFIG.pages.forEach(page => {
        const images = PageImages.getAllForPage(page);
        if (images.hero) totalImages++;
        if (images.about) totalImages++;
        const gallery = Gallery.get(page);
        totalGalleries += gallery.images.length;
    });

    return `
        <div class="welcome-banner" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2>Selamat Datang, ${escapeHtml(session?.name || 'Admin')}! 👋</h2>
            <p style="opacity: 0.9; margin-top: 8px;">Kelola konten website Elyasya Corp dari panel admin ini.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">🖼️</div>
                <div class="stat-info">
                    <h3>${activeSlides}/${slides.length}</h3>
                    <p>Hero Slides Aktif</p>
                    <span class="trend up">Total ${slides.length} slides</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">📸</div>
                <div class="stat-info">
                    <h3>${totalImages}</h3>
                    <p>Page Images</p>
                    <span class="trend">Hero & About images</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">🎨</div>
                <div class="stat-info">
                    <h3>${totalGalleries}</h3>
                    <p>Gallery Images</p>
                    <span class="trend">Across all pages</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">📄</div>
                <div class="stat-info">
                    <h3>${ADMIN_CONFIG.pages.length}</h3>
                    <p>Business Pages</p>
                    <span class="trend">Active pages</span>
                </div>
            </div>
        </div>

        <div class="card mt-2">
            <div class="card-header">
                <h2>🚀 Quick Actions</h2>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <button class="btn btn-primary" onclick="navigateTo('hero-slider')">
                        🖼️ Kelola Hero Slider
                    </button>
                    <button class="btn btn-success" onclick="navigateTo('page-images')">
                        📸 Upload Page Images
                    </button>
                    <button class="btn btn-warning" onclick="navigateTo('galleries')">
                        🎨 Kelola Galeri
                    </button>
                    <button class="btn btn-primary" onclick="window.open('index.html', '_blank')">
                        🌐 Lihat Website
                    </button>
                </div>
            </div>
        </div>

        <div class="card mt-2">
            <div class="card-header">
                <h2>📊 Business Pages Overview</h2>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Hero Image</th>
                                <th>About Image</th>
                                <th>Gallery</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ADMIN_CONFIG.pages.map(page => {
                                const images = PageImages.getAllForPage(page);
                                const gallery = Gallery.get(page);
                                const pageNames = {
                                    hijab: '🧕 Elyasya Hijab',
                                    sembako: '🛒 Kedai Sembako',
                                    travel: '✈️ Travel',
                                    design: '🎨 Design Interior',
                                    management: '💼 Management'
                                };
                                return `
                                    <tr>
                                        <td><strong>${pageNames[page]}</strong></td>
                                        <td>${images.hero ? '<span class="badge badge-success">✓ Set</span>' : '<span class="badge badge-warning">Not set</span>'}</td>
                                        <td>${images.about ? '<span class="badge badge-success">✓ Set</span>' : '<span class="badge badge-warning">Not set</span>'}</td>
                                        <td>${gallery.images.length} images</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="navigateTo('${page}')">Edit</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="card mt-2">
            <div class="card-header">
                <h2>ℹ️ Informasi Sistem</h2>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div>
                        <p class="text-muted">Storage Used</p>
                        <p><strong>${formatFileSize(getLocalStorageSize())}</strong></p>
                    </div>
                    <div>
                        <p class="text-muted">Last Login</p>
                        <p><strong>${new Date(session?.loginTime).toLocaleString('id-ID') || 'N/A'}</strong></p>
                    </div>
                    <div>
                        <p class="text-muted">Admin User</p>
                        <p><strong>${escapeHtml(session?.username || 'Unknown')}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Calculate localStorage size
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage.getItem(key).length * 2; // UTF-16
        }
    }
    return total;
}

// ==========================================
// HERO SLIDER MANAGEMENT PAGE
// ==========================================

function renderHeroSliderPage() {
    return `
        <div class="card">
            <div class="card-header">
                <h2>📋 Daftar Hero Slides</h2>
                <button class="btn btn-primary" onclick="showAddSlideModal()">
                    ➕ Tambah Slide
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="data-table" id="slidesTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Preview</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="slidesTableBody">
                            <!-- Will be populated by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function initHeroSliderPage() {
    refreshSlidesTable();
}

function refreshSlidesTable() {
    const slides = HeroSlides.getAll();
    const tbody = document.getElementById('slidesTableBody');
    if (!tbody) return;

    document.getElementById('slideCount').textContent = slides.length;

    tbody.innerHTML = slides.map(slide => `
        <tr>
            <td>${slide.id}</td>
            <td>
                <div style="width: 80px; height: 50px; border-radius: 6px; overflow: hidden; background: ${slide.bgColor || '#ccc'};">
                    ${slide.imageBase64 || slide.bgImage ? 
                        `<img src="${slide.imageBase64 || slide.bgImage}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">` : 
                        ''}
                </div>
            </td>
            <td><strong>${escapeHtml(slide.title)}</strong></td>
            <td>${escapeHtml(slide.description).substring(0, 50)}...</td>
            <td>
                <span class="badge ${slide.status === 'active' ? 'badge-success' : 'badge-danger'}">
                    ${slide.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="showEditSlideModal(${slide.id})">✏️ Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSlide(${slide.id})">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function showAddSlideModal() {
    const body = `
        <form id="slideForm" onsubmit="saveSlide(event)">
            <input type="hidden" id="slideId" value="">
            <div class="form-row">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" class="form-control" id="slideTitle" required>
                </div>
                <div class="form-group">
                    <label>Business Line</label>
                    <select class="form-control" id="slideBusinessLine">
                        <option value="Umum">Umum</option>
                        <option value="Hijab">Hijab</option>
                        <option value="Sembako">Sembako</option>
                        <option value="Travel">Travel</option>
                        <option value="Design">Design Interior</option>
                        <option value="Management">Management</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea class="form-control" id="slideDescription" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Button Text</label>
                    <input type="text" class="form-control" id="slideButtonText" value="Selengkapnya">
                </div>
                <div class="form-group">
                    <label>Button Link</label>
                    <input type="text" class="form-control" id="slideButtonLink" value="#">
                </div>
            </div>
            <div class="form-group">
                <label>Background Color (CSS Gradient)</label>
                <input type="text" class="form-control" id="slideBgColor" value="linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)">
            </div>
            <div class="form-group">
                <label>Background Image (Optional)</label>
                <div class="file-upload" onclick="document.getElementById('slideImage').click()">
                    <div class="icon">📁</div>
                    <p>Klik untuk upload gambar atau drag & drop</p>
                    <p id="slideImageName" class="text-muted mt-1"></p>
                    <input type="file" id="slideImage" accept="image/*" onchange="handleSlideImageUpload(event)">
                </div>
                <div class="image-preview" id="slideImagePreview" style="display: none;">
                    <img id="slideImagePreviewImg" src="" alt="Preview">
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select class="form-control" id="slideStatus">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-danger" onclick="closeModal()">Batal</button>
        <button class="btn btn-success" onclick="document.getElementById('slideForm').requestSubmit()">💾 Simpan</button>
    `;

    showModal('Tambah Hero Slide', body, footer);
}

function showEditSlideModal(id) {
    const slide = HeroSlides.getById(id);
    if (!slide) return;

    showAddSlideModal();
    
    // Fill form with existing data
    document.getElementById('slideId').value = slide.id;
    document.getElementById('slideTitle').value = slide.title || '';
    document.getElementById('slideDescription').value = slide.description || '';
    document.getElementById('slideButtonText').value = slide.buttonText || 'Selengkapnya';
    document.getElementById('slideButtonLink').value = slide.buttonLink || '#';
    document.getElementById('slideBusinessLine').value = slide.businessLine || 'Umum';
    document.getElementById('slideBgColor').value = slide.bgColor || '';
    document.getElementById('slideStatus').value = slide.status || 'active';

    if (slide.imageBase64 || slide.bgImage) {
        document.getElementById('slideImagePreview').style.display = 'flex';
        document.getElementById('slideImagePreviewImg').src = slide.imageBase64 || slide.bgImage;
    }

    document.getElementById('modalTitle').textContent = 'Edit Hero Slide';
}

async function handleSlideImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB!', 'warning');
        return;
    }

    const base64 = await fileToBase64(file);
    document.getElementById('slideImageName').textContent = file.name;
    document.getElementById('slideImagePreview').style.display = 'flex';
    document.getElementById('slideImagePreviewImg').src = base64;
    document.getElementById('slideImage').dataset.base64 = base64;
}

async function saveSlide(event) {
    event.preventDefault();

    const id = document.getElementById('slideId').value;
    const imageInput = document.getElementById('slideImage');
    
    const slideData = {
        title: document.getElementById('slideTitle').value,
        description: document.getElementById('slideDescription').value,
        buttonText: document.getElementById('slideButtonText').value,
        buttonLink: document.getElementById('slideButtonLink').value,
        businessLine: document.getElementById('slideBusinessLine').value,
        bgColor: document.getElementById('slideBgColor').value,
        status: document.getElementById('slideStatus').value
    };

    let success = false;
    if (id) {
        // Update existing - preserve existing image if no new image uploaded
        const existingSlide = HeroSlides.getById(parseInt(id));
        if (imageInput.dataset.base64) {
            // New image uploaded
            slideData.imageBase64 = imageInput.dataset.base64;
        } else if (existingSlide && existingSlide.imageBase64) {
            // Keep existing image
            slideData.imageBase64 = existingSlide.imageBase64;
        } else {
            slideData.imageBase64 = '';
        }
        success = await HeroSlides.update(parseInt(id), slideData);
        if (success) {
            showToast('Slide berhasil diupdate!', 'success');
        }
    } else {
        // Add new
        slideData.imageBase64 = imageInput.dataset.base64 || '';
        success = await HeroSlides.add(slideData);
        if (success) {
            showToast('Slide baru berhasil ditambahkan!', 'success');
        }
    }

    if (success) {
        closeModal();
        refreshSlidesTable();
    }
}

async function deleteSlide(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus slide ini?')) return;
    
    const success = await HeroSlides.delete(id);
    if (success) {
        showToast('Slide berhasil dihapus!', 'success');
        refreshSlidesTable();
    }
}

// ==========================================
// PAGE IMAGES MANAGEMENT
// ==========================================

function renderPageImagesPage() {
    return `
        <div class="card">
            <div class="card-header">
                <h2>📸 Page Images Management</h2>
            </div>
            <div class="card-body">
                <p class="text-muted mb-2">Kelola gambar Hero dan About untuk setiap halaman bisnis.</p>
                
                <div class="tabs">
                    ${ADMIN_CONFIG.pages.map((page, index) => `
                        <div class="tab ${index === 0 ? 'active' : ''}" onclick="switchPageImageTab('${page}', this)">
                            ${page.charAt(0).toUpperCase() + page.slice(1)}
                        </div>
                    `).join('')}
                </div>

                ${ADMIN_CONFIG.pages.map((page, index) => `
                    <div class="tab-content ${index === 0 ? 'active' : ''}" id="tab-${page}">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Hero Image</label>
                                <div class="file-upload" onclick="document.getElementById('${page}_hero_input').click()">
                                    <div class="icon">🖼️</div>
                                    <p>Upload Hero Image</p>
                                    <input type="file" id="${page}_hero_input" accept="image/*" onchange="uploadPageImage('${page}', 'hero', event)" style="display:none">
                                </div>
                                <div class="image-preview mt-1" id="${page}_hero_preview">
                                    <img src="" alt="Hero Preview" style="display:none">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>About Image</label>
                                <div class="file-upload" onclick="document.getElementById('${page}_about_input').click()">
                                    <div class="icon">🖼️</div>
                                    <p>Upload About Image</p>
                                    <input type="file" id="${page}_about_input" accept="image/*" onchange="uploadPageImage('${page}', 'about', event)" style="display:none">
                                </div>
                                <div class="image-preview mt-1" id="${page}_about_preview">
                                    <img src="" alt="About Preview" style="display:none">
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function initPageImagesPage() {
    // Load existing images
    ADMIN_CONFIG.pages.forEach(page => {
        const images = PageImages.getAllForPage(page);
        if (images.hero) {
            const preview = document.querySelector(`#${page}_hero_preview img`);
            if (preview) {
                preview.src = images.hero.src || images.hero;
                preview.style.display = 'block';
            }
        }
        if (images.about) {
            const preview = document.querySelector(`#${page}_about_preview img`);
            if (preview) {
                preview.src = images.about.src || images.about;
                preview.style.display = 'block';
            }
        }
    });
}

function switchPageImageTab(page, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(`tab-${page}`).classList.add('active');
}

async function uploadPageImage(page, type, event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB!', 'warning');
        return;
    }

    try {
        const base64 = await fileToBase64(file);
        const imageData = {
            src: base64,
            name: file.name,
            size: file.size,
            uploadDate: new Date().toISOString()
        };

        const success = await PageImages.save(page, type, imageData);
        
        if (success) {
            const preview = document.querySelector(`#${page}_${type}_preview img`);
            if (preview) {
                preview.src = base64;
                preview.style.display = 'block';
            }
            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} image untuk ${page} berhasil diupload!`, 'success');
        }
    } catch (e) {
        console.error('Error uploading image:', e);
        showToast('Gagal mengupload gambar: ' + e.message, 'error');
    }
}

// ==========================================
// GALLERIES MANAGEMENT
// ==========================================

function renderGalleriesPage() {
    return `
        <div class="card">
            <div class="card-header">
                <h2>🎨 Gallery Management</h2>
            </div>
            <div class="card-body">
                <p class="text-muted mb-2">Kelola galeri foto untuk setiap halaman bisnis.</p>
                
                <div class="tabs">
                    ${ADMIN_CONFIG.pages.map((page, index) => `
                        <div class="tab ${index === 0 ? 'active' : ''}" onclick="switchGalleryTab('${page}', this)">
                            ${page.charAt(0).toUpperCase() + page.slice(1)}
                        </div>
                    `).join('')}
                </div>

                ${ADMIN_CONFIG.pages.map((page, index) => `
                    <div class="tab-content ${index === 0 ? 'active' : ''}" id="gallery-tab-${page}">
                        <div class="d-flex justify-between align-center mb-2">
                            <h3>Gallery: ${page.charAt(0).toUpperCase() + page.slice(1)}</h3>
                            <button class="btn btn-primary" onclick="showAddGalleryImageModal('${page}')">
                                ➕ Tambah Gambar
                            </button>
                        </div>
                        <div class="gallery-grid" id="gallery-grid-${page}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
                            <!-- Will be populated by JS -->
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function initGalleriesPage() {
    ADMIN_CONFIG.pages.forEach(page => {
        refreshGalleryGrid(page);
    });
}

function switchGalleryTab(page, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(`gallery-tab-${page}`).classList.add('active');
}

function refreshGalleryGrid(page) {
    const gallery = Gallery.get(page);
    const grid = document.getElementById(`gallery-grid-${page}`);
    if (!grid) return;

    if (gallery.images.length === 0) {
        grid.innerHTML = '<p class="text-muted">Belum ada gambar di galeri ini.</p>';
        return;
    }

    grid.innerHTML = gallery.images.map(img => `
        <div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm);">
            <img src="${img.src}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.style.background='#ddd'">
            <div style="position: absolute; top: 5px; right: 5px; display: flex; gap: 5px;">
                <button class="btn btn-sm btn-danger" onclick="deleteGalleryImage('${page}', ${img.id})" style="padding: 5px 8px;">🗑️</button>
            </div>
            ${img.title ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 5px; font-size: 11px;">${escapeHtml(img.title)}</div>` : ''}
        </div>
    `).join('');
}

function showAddGalleryImageModal(page) {
    const body = `
        <form id="galleryForm" onsubmit="saveGalleryImage(event, '${page}')">
            <div class="form-group">
                <label>Gambar *</label>
                <div class="file-upload" onclick="document.getElementById('galleryImage').click()">
                    <div class="icon">📁</div>
                    <p>Klik untuk upload gambar</p>
                    <p id="galleryImageName" class="text-muted mt-1"></p>
                    <input type="file" id="galleryImage" accept="image/*" onchange="handleGalleryImageUpload(event)" required style="display:none">
                </div>
                <div class="image-preview mt-1" id="galleryImagePreview" style="display: none;">
                    <img id="galleryImagePreviewImg" src="" alt="Preview">
                </div>
            </div>
            <div class="form-group">
                <label>Judul (Optional)</label>
                <input type="text" class="form-control" id="galleryImageTitle">
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-danger" onclick="closeModal()">Batal</button>
        <button class="btn btn-success" onclick="document.getElementById('galleryForm').requestSubmit()">💾 Simpan</button>
    `;

    showModal('Tambah Gambar Galeri', body, footer);
}

async function handleGalleryImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB!', 'warning');
        return;
    }

    const base64 = await fileToBase64(file);
    document.getElementById('galleryImageName').textContent = file.name;
    document.getElementById('galleryImagePreview').style.display = 'flex';
    document.getElementById('galleryImagePreviewImg').src = base64;
    document.getElementById('galleryImage').dataset.base64 = base64;
}

async function saveGalleryImage(event, page) {
    event.preventDefault();

    const imageInput = document.getElementById('galleryImage');
    const base64 = imageInput.dataset.base64;

    if (!base64) {
        showToast('Pilih gambar terlebih dahulu!', 'warning');
        return;
    }

    const imageData = {
        src: base64,
        title: document.getElementById('galleryImageTitle').value,
        name: imageInput.files[0]?.name || 'image'
    };

    const success = await Gallery.addImage(page, imageData);
    
    if (success) {
        showToast('Gambar berhasil ditambahkan ke galeri!', 'success');
        closeModal();
        refreshGalleryGrid(page);
    }
}

async function deleteGalleryImage(page, imageId) {
    if (!confirm('Hapus gambar ini dari galeri?')) return;
    
    const success = await Gallery.removeImage(page, imageId);
    if (success) {
        showToast('Gambar berhasil dihapus!', 'success');
        refreshGalleryGrid(page);
    }
}

// ==========================================
// TESTIMONIALS MANAGEMENT
// ==========================================

function renderTestimonialsPage() {
    return `
        <div class="card">
            <div class="card-header">
                <h2>💬 Testimonials Management</h2>
            </div>
            <div class="card-body">
                <p class="text-muted mb-2">Kelola testimonial untuk halaman Hijab dan Management.</p>
                
                <div class="tabs">
                    <div class="tab active" onclick="switchTestimonialTab('hijab', this)">Hijab</div>
                    <div class="tab" onclick="switchTestimonialTab('management', this)">Management</div>
                </div>

                <div class="tab-content active" id="testi-tab-hijab">
                    <div class="d-flex justify-between align-center mb-2">
                        <h3>Testimonials: Elyasya Hijab</h3>
                        <button class="btn btn-primary" onclick="showAddTestimonialModal('hijab')">➕ Tambah</button>
                    </div>
                    <div id="testi-list-hijab"></div>
                </div>

                <div class="tab-content" id="testi-tab-management">
                    <div class="d-flex justify-between align-center mb-2">
                        <h3>Testimonials: Management</h3>
                        <button class="btn btn-primary" onclick="showAddTestimonialModal('management')">➕ Tambah</button>
                    </div>
                    <div id="testi-list-management"></div>
                </div>
            </div>
        </div>
    `;
}

function initTestimonialsPage() {
    refreshTestimonialList('hijab');
    refreshTestimonialList('management');
}

function switchTestimonialTab(page, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(`testi-tab-${page}`).classList.add('active');
}

function refreshTestimonialList(page) {
    const data = Testimonials.get(page);
    const list = document.getElementById(`testi-list-${page}`);
    if (!list) return;

    if (data.images.length === 0) {
        list.innerHTML = '<p class="text-muted">Belum ada testimonial.</p>';
        return;
    }

    list.innerHTML = data.images.map(testi => `
        <div class="card mb-1" style="border: 1px solid var(--border-color);">
            <div class="card-body" style="padding: 15px; display: flex; gap: 15px; align-items: center;">
                <div style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; flex-shrink: 0;">
                    ${testi.src ? `<img src="${testi.src}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width: 100%; height: 100%; background: #ddd; display: flex; align-items: center; justify-content: center;">👤</div>'}
                </div>
                <div style="flex: 1;">
                    <strong>${escapeHtml(testi.name || 'Anonymous')}</strong>
                    <p style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(testi.text || '')}</p>
                    ${testi.rating ? `<p style="color: #f39c12;">${'⭐'.repeat(testi.rating)}</p>` : ''}
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${page}', ${testi.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function showAddTestimonialModal(page) {
    const body = `
        <form id="testiForm" onsubmit="saveTestimonial(event, '${page}')">
            <div class="form-group">
                <label>Foto (Optional)</label>
                <div class="file-upload" onclick="document.getElementById('testiImage').click()">
                    <div class="icon">📁</div>
                    <p>Upload foto</p>
                    <input type="file" id="testiImage" accept="image/*" onchange="handleTestiImageUpload(event)" style="display:none">
                </div>
                <div class="image-preview mt-1" id="testiImagePreview" style="display: none; max-width: 100px; aspect-ratio: 1; border-radius: 50%;">
                    <img id="testiImagePreviewImg" src="" alt="Preview">
                </div>
            </div>
            <div class="form-group">
                <label>Nama *</label>
                <input type="text" class="form-control" id="testiName" required>
            </div>
            <div class="form-group">
                <label>Testimonial *</label>
                <textarea class="form-control" id="testiText" required></textarea>
            </div>
            <div class="form-group">
                <label>Rating (1-5)</label>
                <select class="form-control" id="testiRating">
                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4">⭐⭐⭐⭐ (4)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                    <option value="2">⭐⭐ (2)</option>
                    <option value="1">⭐ (1)</option>
                </select>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-danger" onclick="closeModal()">Batal</button>
        <button class="btn btn-success" onclick="document.getElementById('testiForm').requestSubmit()">💾 Simpan</button>
    `;

    showModal('Tambah Testimonial', body, footer);
}

async function handleTestiImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    document.getElementById('testiImagePreview').style.display = 'flex';
    document.getElementById('testiImagePreviewImg').src = base64;
    document.getElementById('testiImage').dataset.base64 = base64;
}

async function saveTestimonial(event, page) {
    event.preventDefault();

    const imageInput = document.getElementById('testiImage');
    
    const testimonial = {
        src: imageInput.dataset.base64 || '',
        name: document.getElementById('testiName').value,
        text: document.getElementById('testiText').value,
        rating: parseInt(document.getElementById('testiRating').value)
    };

    const success = await Testimonials.add(page, testimonial);
    
    if (success) {
        showToast('Testimonial berhasil ditambahkan!', 'success');
        closeModal();
        refreshTestimonialList(page);
    }
}

async function deleteTestimonial(page, id) {
    if (!confirm('Hapus testimonial ini?')) return;
    
    const success = await Testimonials.remove(page, id);
    if (success) {
        showToast('Testimonial berhasil dihapus!', 'success');
        refreshTestimonialList(page);
    }
}

// ==========================================
// BUSINESS PAGE MANAGEMENT
// ==========================================

function renderBusinessPage(page) {
    const pageNames = {
        hijab: 'Elyasya Hijab',
        sembako: 'Kedai Sembako',
        travel: 'Travel',
        design: 'Design Interior',
        management: 'Management'
    };

    const images = PageImages.getAllForPage(page);
    const gallery = Gallery.get(page);

    return `
        <div class="card">
            <div class="card-header">
                <h2>📄 ${pageNames[page]} - Content Management</h2>
                <a href="${page === 'design' ? 'design-interior' : page}.html" target="_blank" class="btn btn-sm btn-primary">🌐 View Page</a>
            </div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Hero Image</label>
                        <p>${images.hero ? '<span class="badge badge-success">✓ Uploaded</span>' : '<span class="badge badge-warning">Not set</span>'}</p>
                        <button class="btn btn-sm btn-primary mt-1" onclick="navigateTo('page-images')">Edit di Page Images</button>
                    </div>
                    <div class="form-group">
                        <label>About Image</label>
                        <p>${images.about ? '<span class="badge badge-success">✓ Uploaded</span>' : '<span class="badge badge-warning">Not set</span>'}</p>
                        <button class="btn btn-sm btn-primary mt-1" onclick="navigateTo('page-images')">Edit di Page Images</button>
                    </div>
                </div>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border-color);">
                
                <h3 class="mb-1">Gallery (${gallery.images.length} images)</h3>
                <button class="btn btn-sm btn-primary mb-2" onclick="navigateTo('galleries')">Kelola Gallery</button>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;">
                    ${gallery.images.slice(0, 6).map(img => `
                        <div style="aspect-ratio: 1; border-radius: 6px; overflow: hidden;">
                            <img src="${img.src}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.style.background='#ddd'">
                        </div>
                    `).join('')}
                    ${gallery.images.length === 0 ? '<p class="text-muted">Belum ada gambar di galeri.</p>' : ''}
                </div>
            </div>
        </div>
    `;
}

function initBusinessPage(page) {
    // Page is static, no additional init needed
}

// ==========================================
// SETTINGS PAGE
// ==========================================

function renderSettingsPage() {
    const session = Auth.getSession();
    
    return `
        <div class="card">
            <div class="card-header">
                <h2>⚙️ Admin Settings</h2>
            </div>
            <div class="card-body">
                <div class="tabs">
                    <div class="tab active" onclick="switchSettingsTab('profile', this)">Profile</div>
                    <div class="tab" onclick="switchSettingsTab('users', this)">Users</div>
                    <div class="tab" onclick="switchSettingsTab('data', this)">Data Management</div>
                </div>

                <div class="tab-content active" id="settings-tab-profile">
                    <h3 class="mb-2">Profile Settings</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" class="form-control" value="${escapeHtml(session?.username || '')}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Role</label>
                            <input type="text" class="form-control" value="${escapeHtml(session?.role || '')}" disabled>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Display Name</label>
                        <input type="text" class="form-control" id="settingsName" value="${escapeHtml(session?.name || '')}">
                    </div>
                    <button class="btn btn-primary" onclick="saveProfile()">💾 Save Profile</button>
                </div>

                <div class="tab-content" id="settings-tab-users">
                    <h3 class="mb-2">User Management</h3>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody"></tbody>
                        </table>
                    </div>
                </div>

                <div class="tab-content" id="settings-tab-data">
                    <h3 class="mb-2">Data Management</h3>
                    <p class="text-muted mb-2">Kelola data yang tersimpan di localStorage.</p>
                    
                    <div class="card mb-2" style="border: 1px solid var(--border-color);">
                        <div class="card-body">
                            <h4>Storage Information</h4>
                            <p>Total Storage Used: <strong>${formatFileSize(getLocalStorageSize())}</strong></p>
                        </div>
                    </div>

                    <div class="d-flex gap-1">
                        <button class="btn btn-warning" onclick="exportData()">📥 Export All Data</button>
                        <button class="btn btn-danger" onclick="clearAllData()">🗑️ Clear All Data</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initSettingsPage() {
    refreshUsersTable();
}

function switchSettingsTab(tab, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(`settings-tab-${tab}`).classList.add('active');
}

function refreshUsersTable() {
    Auth.initUsers();
    const adminData = JSON.parse(localStorage.getItem(ADMIN_CONFIG.accountKey) || '{}');
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td>${escapeHtml(adminData.username || 'admin')}</td>
            <td>${escapeHtml(adminData.name || 'Administrator')}</td>
            <td><span class="badge badge-info">Super Admin</span></td>
        </tr>
    `;
}

function saveProfile() {
    const name = document.getElementById('settingsName').value;
    const session = Auth.getSession();
    
    if (session) {
        session.name = name;
        if (localStorage.getItem(ADMIN_CONFIG.sessionKey)) {
            localStorage.setItem(ADMIN_CONFIG.sessionKey, JSON.stringify(session));
        } else {
            sessionStorage.setItem(ADMIN_CONFIG.sessionKey, JSON.stringify(session));
        }
        
        document.getElementById('userName').textContent = name;
        showToast('Profile berhasil disimpan!', 'success');
    }
}

async function exportData() {
    const data = {};
    
    // Export from IndexedDB
    try {
        const keys = await IndexedDB.getAllKeys();
        for (const key of keys) {
            if (key.startsWith('heroSlides') || key.startsWith('pageImage_') || key.startsWith('pageGallery_') || key.startsWith('pageTestimonials_')) {
                data[key] = await IndexedDB.get(key);
            }
        }
    } catch (e) {
        console.error('Error exporting from IndexedDB:', e);
    }
    
    // Also export from localStorage for backward compatibility
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('heroSlides') || key.startsWith('pageImage_') || key.startsWith('pageGallery_') || key.startsWith('pageTestimonials_'))) {
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                data[key] = localStorage.getItem(key);
            }
        }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elyasya-admin-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Data berhasil diexport!', 'success');
}

async function clearAllData() {
    if (!confirm('PERINGATAN: Semua data website (slides, images, galleries) akan dihapus! Lanjutkan?')) return;
    if (!confirm('Apakah Anda benar-benar yakin? Tindakan ini tidak dapat dibatalkan!')) return;

    // Clear from IndexedDB
    try {
        const keys = await IndexedDB.getAllKeys();
        for (const key of keys) {
            if (key.startsWith('heroSlides') || key.startsWith('pageImage_') || key.startsWith('pageGallery_') || key.startsWith('pageTestimonials_')) {
                await IndexedDB.remove(key);
            }
        }
    } catch (e) {
        console.error('Error clearing IndexedDB:', e);
    }

    // Clear from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('heroSlides') || key.startsWith('pageImage_') || key.startsWith('pageGallery_') || key.startsWith('pageTestimonials_'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reinitialize caches
    await HeroSlides.init();
    await PageImages.init();
    await Gallery.init();
    await Testimonials.init();
    
    showToast('Semua data website berhasil dihapus!', 'warning');
    navigateTo('dashboard');
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!Auth.requireAuth()) return;

    // Initialize users
    Auth.initUsers();

    // Update user info in header
    const session = Auth.getSession();
    if (session) {
        document.getElementById('userName').textContent = session.name;
        document.getElementById('userAvatar').textContent = session.name.charAt(0).toUpperCase();
    }

    // Show loading indicator
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        contentArea.innerHTML = '<div style="text-align: center; padding: 50px;"><div class="spinner"></div><p>Loading data...</p></div>';
    }

    // Initialize IndexedDB and migrate data from localStorage
    try {
        await IndexedDB.open();
        await DataStore.migrateFromLocalStorage();
        
        // Initialize all data modules (load from IndexedDB to cache)
        await HeroSlides.init();
        await PageImages.init();
        await Gallery.init();
        await Testimonials.init();
        
        console.log('✅ All data modules initialized from IndexedDB');
    } catch (e) {
        console.error('Error initializing data modules:', e);
        showToast('Error loading data: ' + e.message, 'error');
    }

    // Update slide count badge
    const slides = HeroSlides.getAll();
    const slideCountEl = document.getElementById('slideCount');
    if (slideCountEl) {
        slideCountEl.textContent = slides.length;
    }

    // Load dashboard
    navigateTo('dashboard');

    console.log('✅ Elyasya Admin Panel loaded successfully with IndexedDB!');
});

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});