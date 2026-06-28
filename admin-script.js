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
    pages: ['index', 'hijab', 'sembako', 'travel', 'design', 'management']
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
    // Default slides - 5 slide untuk 5 lini bisnis Elyasya Corp
    defaultSlides: [
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
// MESSAGES MANAGEMENT (Contact Form Submissions)
// ==========================================

const Messages = {
    _cache: [],
    STORAGE_KEY: 'contactMessages',

    async init() {
        const data = await DataStore.get(this.STORAGE_KEY, []);
        this._cache = Array.isArray(data) ? data : [];
    },

    getAll() {
        return this._cache || [];
    },

    getById(id) {
        return this.getAll().find(m => m.id === id) || null;
    },

    getUnreadCount() {
        return this.getAll().filter(m => !m.read).length;
    },

    async saveAll(messages) {
        this._cache = messages;
        return await DataStore.set(this.STORAGE_KEY, messages);
    },

    async add(message) {
        const messages = this.getAll();
        message.id = Date.now();
        message.read = false;
        message.createdAt = new Date().toISOString();
        messages.unshift(message);
        return await this.saveAll(messages);
    },

    async markAsRead(id) {
        const messages = this.getAll();
        const msg = messages.find(m => m.id === id);
        if (msg) {
            msg.read = true;
            return await this.saveAll(messages);
        }
        return false;
    },

    async markAsUnread(id) {
        const messages = this.getAll();
        const msg = messages.find(m => m.id === id);
        if (msg) {
            msg.read = false;
            return await this.saveAll(messages);
        }
        return false;
    },

    async markAllAsRead() {
        const messages = this.getAll();
        messages.forEach(m => m.read = true);
        return await this.saveAll(messages);
    },

    async delete(id) {
        let messages = this.getAll();
        messages = messages.filter(m => m.id !== id);
        return await this.saveAll(messages);
    },

    async deleteAll() {
        return await this.saveAll([]);
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
        'messages': { title: 'Pesan', subtitle: 'Kelola pesan masuk dari formulir kontak' },
        'hero-slider': { title: 'Hero Slider', subtitle: 'Kelola slider di halaman utama' },
        'page-images': { title: 'Page Images', subtitle: 'Kelola gambar hero dan about per halaman' },
        'galleries': { title: 'Galleries', subtitle: 'Kelola galeri foto per halaman bisnis' },
        'testimonials': { title: 'Testimonials', subtitle: 'Kelola testimonial pelanggan' },
        'hijab': { title: 'Elyasya Hijab', subtitle: 'Kelola konten halaman Hijab' },
        'sembako': { title: 'Kedai Sembako', subtitle: 'Kelola konten halaman Sembako' },
        'travel': { title: 'Travel', subtitle: 'Kelola konten halaman Travel' },
        'index': { title: 'Halaman Utama', subtitle: 'Kelola konten halaman utama (index.html)' },
        'design': { title: 'Design Interior', subtitle: 'Kelola konten halaman Design Interior' },
        'management': { title: 'Management', subtitle: 'Kelola konten halaman Management' },
        'lini-bisnis': { title: 'Lini Bisnis Kami', subtitle: 'Kelola konten section Lini Bisnis di halaman utama' },
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
        case 'messages':
            contentArea.innerHTML = renderMessagesPage();
            initMessagesPage();
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
        case 'business-pages':
            contentArea.innerHTML = renderBusinessPagesMenu();
            break;
        case 'lini-bisnis':
            contentArea.innerHTML = renderLiniBisnisPage();
            initLiniBisnisPage();
            break;

        case 'testimonials':
            contentArea.innerHTML = renderTestimonialsPage();
            initTestimonialsPage();
            break;
        case 'index':
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
// MESSAGES PAGE
// ==========================================

function renderMessagesPage() {
    const messages = Messages.getAll();
    const unreadCount = Messages.getUnreadCount();
    const readCount = messages.length - unreadCount;

    return `
        <div class="messages-toolbar">
            <div class="messages-toolbar-left">
                <span class="messages-stat">
                    <span class="stat-dot unread"></span> ${unreadCount} Belum Dibaca
                </span>
                <span class="messages-stat">
                    <span class="stat-dot read"></span> ${readCount} Sudah Dibaca
                </span>
                <span class="messages-stat">
                    <span class="stat-dot total"></span> ${messages.length} Total Pesan
                </span>
            </div>
            <div class="messages-toolbar-right">
                <button class="btn btn-sm btn-success" onclick="markAllMessagesRead()" ${unreadCount === 0 ? 'disabled' : ''}>
                    ✅ Tandai Semua Dibaca
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAllMessages()" ${messages.length === 0 ? 'disabled' : ''}>
                    🗑️ Hapus Semua
                </button>
            </div>
        </div>

        <div class="messages-filter-bar">
            <button class="filter-btn active" data-filter="all" onclick="filterMessages('all', this)">Semua (${messages.length})</button>
            <button class="filter-btn" data-filter="unread" onclick="filterMessages('unread', this)">Belum Dibaca (${unreadCount})</button>
            <button class="filter-btn" data-filter="read" onclick="filterMessages('read', this)">Sudah Dibaca (${readCount})</button>
        </div>

        <div class="messages-list" id="messagesList">
            ${messages.length === 0 ? `
                <div class="messages-empty">
                    <div class="empty-icon">📭</div>
                    <h3>Belum Ada Pesan</h3>
                    <p>Pesan yang masuk dari formulir kontak website akan muncul di sini.</p>
                </div>
            ` : messages.map(msg => renderMessageCard(msg)).join('')}
        </div>
    `;
}

function renderMessageCard(msg) {
    const date = new Date(msg.createdAt);
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const source = msg.source || 'Contact Form';
    const sourceIcon = {
        'Contact Form': '📧',
        'Hijab': '🧕',
        'Sembako': '🛒',
        'Travel': '✈️',
        'Design Interior': '🎨',
        'Management': '💼'
    }[source] || '📩';

    return `
        <div class="message-card ${msg.read ? 'read' : 'unread'}" id="msg-${msg.id}" onclick="viewMessage(${msg.id})">
            <div class="message-card-left">
                <div class="message-avatar">${(msg.name || 'U').charAt(0).toUpperCase()}</div>
            </div>
            <div class="message-card-body">
                <div class="message-card-header">
                    <div class="message-sender">
                        ${!msg.read ? '<span class="unread-dot"></span>' : ''}
                        <strong>${escapeHtml(msg.name || 'Unknown')}</strong>
                    </div>
                    <div class="message-meta">
                        <span class="message-source">${sourceIcon} ${escapeHtml(source)}</span>
                        <span class="message-date">${dateStr} ${timeStr}</span>
                    </div>
                </div>
                <div class="message-subject">${escapeHtml(msg.subject || '(Tanpa Subjek)')}</div>
                <div class="message-preview">${escapeHtml((msg.message || '').substring(0, 120))}${(msg.message || '').length > 120 ? '...' : ''}</div>
                <div class="message-contact-info">
                    <span>📧 ${escapeHtml(msg.email || '-')}</span>
                    ${msg.phone ? `<span>📱 ${escapeHtml(msg.phone)}</span>` : ''}
                </div>
            </div>
            <div class="message-card-actions" onclick="event.stopPropagation()">
                <button class="btn-icon ${msg.read ? '' : 'btn-primary'}" onclick="toggleMessageRead(${msg.id})" title="${msg.read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}">
                    ${msg.read ? '📭' : '📬'}
                </button>
                <button class="btn-icon btn-danger" onclick="deleteMessage(${msg.id})" title="Hapus">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

function initMessagesPage() {
    updateMessageCountBadge();
}

function updateMessageCountBadge() {
    const badge = document.getElementById('messageCount');
    if (badge) {
        const count = Messages.getUnreadCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

function filterMessages(filter, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const messages = Messages.getAll();
    let filtered = messages;
    if (filter === 'unread') filtered = messages.filter(m => !m.read);
    if (filter === 'read') filtered = messages.filter(m => m.read);

    const list = document.getElementById('messagesList');
    if (!list) return;

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="messages-empty">
                <div class="empty-icon">📭</div>
                <h3>Tidak Ada Pesan</h3>
                <p>Tidak ada pesan dalam kategori ini.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(msg => renderMessageCard(msg)).join('');
}

function viewMessage(id) {
    const msg = Messages.getById(id);
    if (!msg) return;

    // Mark as read when viewed
    if (!msg.read) {
        Messages.markAsRead(id).then(() => {
            updateMessageCountBadge();
        });
    }

    const date = new Date(msg.createdAt);
    const dateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const body = `
        <div class="message-detail">
            <div class="message-detail-header">
                <div class="message-avatar-lg">${(msg.name || 'U').charAt(0).toUpperCase()}</div>
                <div>
                    <h3>${escapeHtml(msg.name || 'Unknown')}</h3>
                    <p class="text-muted">${escapeHtml(msg.email || '-')} ${msg.phone ? ' · ' + escapeHtml(msg.phone) : ''}</p>
                    <p class="text-muted" style="font-size: 12px;">📅 ${dateStr} · 🕐 ${timeStr}</p>
                </div>
            </div>
            <div class="message-detail-subject">
                <strong>Subjek:</strong> ${escapeHtml(msg.subject || '(Tanpa Subjek)')}
            </div>
            <div class="message-detail-body">
                ${escapeHtml(msg.message || '(Pesan kosong)').replace(/\n/g, '<br>')}
            </div>
            <div class="message-detail-actions">
                ${msg.email ? `<a href="mailto:${escapeHtml(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject || '')}" class="btn btn-primary" target="_blank">📧 Balas via Email</a>` : ''}
                ${msg.phone ? `<a href="https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}" class="btn btn-success" target="_blank">💬 Balas via WhatsApp</a>` : ''}
                <button class="btn btn-warning" onclick="toggleMessageRead(${msg.id}); closeModal(); navigateTo('messages');">
                    ${msg.read ? '📭 Tandai Belum Dibaca' : '📬 Tandai Sudah Dibaca'}
                </button>
                <button class="btn btn-danger" onclick="deleteMessage(${msg.id}); closeModal();">🗑️ Hapus</button>
            </div>
        </div>
    `;

    showModal('Detail Pesan', body, '');

    // Update the card to show as read
    const card = document.getElementById(`msg-${id}`);
    if (card) {
        card.classList.remove('unread');
        card.classList.add('read');
        const dot = card.querySelector('.unread-dot');
        if (dot) dot.remove();
    }
}

async function toggleMessageRead(id) {
    const msg = Messages.getById(id);
    if (!msg) return;

    if (msg.read) {
        await Messages.markAsUnread(id);
        showToast('Pesan ditandai sebagai belum dibaca', 'info');
    } else {
        await Messages.markAsRead(id);
        showToast('Pesan ditandai sebagai sudah dibaca', 'success');
    }

    updateMessageCountBadge();
    navigateTo('messages');
}

async function deleteMessage(id) {
    if (!confirm('Hapus pesan ini?')) return;

    await Messages.delete(id);
    showToast('Pesan berhasil dihapus!', 'success');
    updateMessageCountBadge();
    navigateTo('messages');
}

async function markAllMessagesRead() {
    await Messages.markAllAsRead();
    showToast('Semua pesan ditandai sebagai sudah dibaca!', 'success');
    updateMessageCountBadge();
    navigateTo('messages');
}

async function deleteAllMessages() {
    if (!confirm('Hapus SEMUA pesan? Tindakan ini tidak dapat dibatalkan!')) return;
    if (!confirm('Apakah Anda benar-benar yakin?')) return;

    await Messages.deleteAll();
    showToast('Semua pesan berhasil dihapus!', 'warning');
    updateMessageCountBadge();
    navigateTo('messages');
}

// ==========================================
// HERO SLIDER MANAGEMENT PAGE
// ==========================================

function renderHeroSliderPage() {
    const slides = HeroSlides.getAll();
    return `
        <div class="card">
            <div class="card-header">
                <h2> Daftar Hero Slides (${slides.length} slide)</h2>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="showAddSlideModal()">
                        ➕ Tambah Slide
                    </button>
                    <button class="btn btn-warning" onclick="resetToDefaultSlides()" title="Reset ke 5 slide default">
                        🔄 Reset ke Default
                    </button>
                </div>
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

    // Update slide count badge if element exists
    const slideCountEl = document.getElementById('slideCount');
    if (slideCountEl) {
        slideCountEl.textContent = slides.length;
    }

    tbody.innerHTML = slides.map(slide => `
        <tr>
            <td>${slide.id}</td>
            <td>
                <div style="width: 80px; height: 50px; border-radius: 6px; overflow: hidden; background: ${slide.bgColor || '#ccc'};">
                    ${slide.imageBase64 || slide.bgImage ? 
                        `<img src="${slide.imageBase64 || slide.bgImage}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">` : 
                        '<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:10px;color:#fff;">No Image</span>'}
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

// Reset slides to default 5 slides
async function resetToDefaultSlides() {
    if (!confirm('Reset ke 5 slide default? Semua slide saat ini akan diganti.')) return;
    
    try {
        // Deep copy default slides to avoid reference issues
        const defaultSlides = JSON.parse(JSON.stringify(HeroSlides.defaultSlides));
        
        // Save to IndexedDB
        const success = await HeroSlides.saveAll(defaultSlides);
        
        if (success) {
            showToast('Slide berhasil direset ke 5 slide default!', 'success');
            refreshSlidesTable();
            
            // Reload the main page slider if it's open
            if (typeof window !== 'undefined' && window.parent !== window) {
                try {
                    window.parent.location.reload();
                } catch (e) {}
            }
        } else {
            showToast('Gagal mereset slide.', 'error');
        }
    } catch (e) {
        console.error('Error resetting slides:', e);
        showToast('Error: ' + e.message, 'error');
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
// BUSINESS PAGE CONTENT MANAGEMENT
// ==========================================

// Page content data structure for each business page
const PAGE_CONTENT_CONFIG = {
    index: {
        name: 'Halaman Utama',
        sections: [
            {
                id: 'about',
                title: 'Tentang Kami Section',
                fields: [
                    { id: 'about_title', label: 'Judul Tentang Kami', type: 'text', default: 'Tentang Elyasya Corp' },
                    { id: 'about_lead', label: 'Deskripsi Singkat', type: 'textarea', default: 'Elyasya Corp adalah holding company yang menaungi 5 pilar bisnis strategis, melayani berbagai kebutuhan masyarakat dan korporat.' },
                    { id: 'vision_title', label: 'Judul Visi', type: 'text', default: 'Visi' },
                    { id: 'vision_text', label: 'Teks Visi', type: 'textarea', default: 'Menjadi konglomerasi terpercaya yang memberikan solusi terbaik di berbagai sektor bisnis dengan standar kualitas internasional.' },
                    { id: 'mission_title', label: 'Judul Misi', type: 'text', default: 'Misi' },
                    { id: 'mission_text', label: 'Teks Misi (HTML)', type: 'textarea', default: '<li>Memberikan layanan berkualitas tinggi di setiap lini bisnis</li><li>Membangun kepercayaan jangka panjang dengan klien dan mitra</li><li>Berinovasi secara berkelanjutan untuk pertumbuhan bisnis</li><li>Berkontribusi positif bagi masyarakat dan lingkungan</li>' }
                ]
            },
            {
                id: 'contact',
                title: 'Contact Information',
                fields: [
                    { id: 'contact_address', label: 'Alamat', type: 'textarea', default: 'Jl. KH. Ahmad Kholil Dusun Cangaan, Genteng Wetan<br>Banyuwangi, Jawa Timur 68465' },
                    { id: 'contact_email', label: 'Email', type: 'text', default: 'info@elyasyacorp.id' },
                    { id: 'contact_phone', label: 'Telepon / WA', type: 'text', default: '+62 813-3423-6869' },
                    { id: 'contact_whatsapp', label: 'Nomor WhatsApp', type: 'text', default: '+62 813-3423-6869' },
                    { id: 'contact_whatsapp_link', label: 'Link WhatsApp', type: 'text', default: 'https://wa.me/6281334236869' }
                ]
            }
        ]
    },
    hijab: {
        name: 'Elyasya Hijab',
        sections: [
            {
                id: 'hero',
                title: '🎯 Hero Section',
                fields: [
                    { id: 'hero_badge', label: 'Badge Text', type: 'text', default: '✨ Hadir Sejak 2016' },
                    { id: 'hero_title', label: 'Judul Utama', type: 'text', default: 'Elyasya <span>Fashion</span> Hijab' },
                    { id: 'hero_tagline', label: 'Tagline', type: 'text', default: 'Toko hijab paling lengkap, terjangkau, dan bisa grosir.' },
                    { id: 'hero_description', label: 'Deskripsi', type: 'textarea', default: 'Melayani retail maupun grosir untuk kebutuhan hijab, inner, dan aksesori wanita Anda' },
                    { id: 'hero_btn_primary_text', label: 'Teks Tombol Utama', type: 'text', default: '🛍️ Belanja Sekarang' },
                    { id: 'hero_btn_primary_link', label: 'Link Tombol Utama', type: 'text', default: 'https://wa.me/6281334236869?text=Halo, saya ingin melihat katalog Elyasya Fashion Hijab' },
                    { id: 'hero_btn_secondary_text', label: 'Teks Tombol Kedua', type: 'text', default: '📋 Lihat Koleksi' },
                ]
            },
            {
                id: 'about',
                title: 'ℹ️ About Section',
                fields: [
                    { id: 'about_subtitle', label: 'Subtitle', type: 'text', default: 'Teman belanja hijab & aksesori sejak 2016' },
                    { id: 'about_text', label: 'Deskripsi', type: 'textarea', default: 'Elyasya Fashion Hijab adalah toko hijab fashion yang telah hadir sejak 2016. Menyediakan koleksi hijab, inner, dan aksesori wanita pilihan dengan kualitas terbaik untuk melengkapi setiap penampilan, melayani pelanggan retail maupun grosir.' },
                    { id: 'about_categories_title', label: 'Judul Kategori', type: 'text', default: 'Kategori Utama Kami:' },
                    { id: 'about_cat1', label: 'Kategori 1', type: 'text', default: 'Semua Jenis Hijab' },
                    { id: 'about_cat2', label: 'Kategori 2', type: 'text', default: 'Inner Hijab' },
                    { id: 'about_cat3', label: 'Kategori 3', type: 'text', default: 'Aksesori Pendukung Hijab' },
                    { id: 'about_cat4', label: 'Kategori 4', type: 'text', default: 'Aksesori Wanita Lainnya' },
                ]
            },
            {
                id: 'contact',
                title: '📞 Contact Information',
                fields: [
                    { id: 'contact_instagram', label: 'Instagram Username', type: 'text', default: '@elyasyafashionhijab' },
                    { id: 'contact_instagram_link', label: 'Instagram Link', type: 'text', default: 'https://instagram.com/elyasyafashionhijab' },
                    { id: 'contact_whatsapp', label: 'WhatsApp Number', type: 'text', default: '+62 813-3423-6869' },
                    { id: 'contact_whatsapp_link', label: 'WhatsApp Link', type: 'text', default: 'https://wa.me/6281334236869' },
                    { id: 'contact_marketplace', label: 'Marketplace Name', type: 'text', default: 'elyasyahijab' },
                    { id: 'contact_address', label: 'Alamat Toko', type: 'textarea', default: 'Jl. KH. Ahmad Kholil Dusun Cangaan, Genteng Wetan<br>Banyuwangi, Jawa Timur 68465' },
                ]
            }
        ]
    },
    sembako: {
        name: 'Kedai Sembako',
        sections: [
            {
                id: 'hero',
                title: '🎯 Hero Section',
                fields: [
                    { id: 'hero_badge', label: 'Badge Text', type: 'text', default: ' Sembako Terlengkap' },
                    { id: 'hero_title', label: 'Judul Utama', type: 'text', default: 'Kedai Sembako <span>Elyasya</span>' },
                    { id: 'hero_tagline', label: 'Tagline', type: 'text', default: 'Belanja kebutuhan pokok harian, lengkap dan hemat.' },
                    { id: 'hero_description', label: 'Deskripsi', type: 'textarea', default: 'Menyediakan berbagai kebutuhan pokok sehari-hari dengan harga terjangkau dan kualitas terjamin.' },
                    { id: 'hero_btn_primary_text', label: 'Teks Tombol Utama', type: 'text', default: '🛒 Belanja Sekarang' },
                    { id: 'hero_btn_primary_link', label: 'Link Tombol Utama', type: 'text', default: 'https://wa.me/6281334236869?text=Halo, saya ingin belanja di Kedai Sembako Elyasya' },
                    { id: 'hero_btn_secondary_text', label: 'Teks Tombol Kedua', type: 'text', default: '📋 Lihat Produk' },
                ]
            },
            {
                id: 'about',
                title: '️ About Section',
                fields: [
                    { id: 'about_subtitle', label: 'Subtitle', type: 'text', default: 'Kebutuhan pokok dalam satu tempat' },
                    { id: 'about_text', label: 'Deskripsi', type: 'textarea', default: 'Kedai Sembako Elyasya menyediakan berbagai kebutuhan pokok sehari-hari dengan harga terjangkau dan kualitas terjamin untuk keluarga Anda.' },
                ]
            },
            {
                id: 'contact',
                title: '📞 Contact Information',
                fields: [
                    { id: 'contact_instagram', label: 'Instagram Username', type: 'text', default: '@kedaisembako.elyasya' },
                    { id: 'contact_instagram_link', label: 'Instagram Link', type: 'text', default: 'https://instagram.com/kedaisembako.elyasya' },
                    { id: 'contact_whatsapp', label: 'WhatsApp Number', type: 'text', default: '+62 813-3423-6869' },
                    { id: 'contact_whatsapp_link', label: 'WhatsApp Link', type: 'text', default: 'https://wa.me/6281334236869' },
                    { id: 'contact_address', label: 'Alamat Toko', type: 'textarea', default: 'Jl. KH. Ahmad Kholil Dusun Cangaan, Genteng Wetan<br>Banyuwangi, Jawa Timur 68465' },
                ]
            }
        ]
    },
    travel: {
        name: 'Travel',
        sections: [
            {
                id: 'hero',
                title: '🎯 Hero Section',
                fields: [
                    { id: 'hero_badge', label: 'Badge Text', type: 'text', default: '✈️ Travel Terpercaya' },
                    { id: 'hero_title', label: 'Judul Utama', type: 'text', default: 'Elyasya <span>Travel</span>' },
                    { id: 'hero_tagline', label: 'Tagline', type: 'text', default: 'Wujudkan perjalanan impian Anda bersama kami.' },
                    { id: 'hero_description', label: 'Deskripsi', type: 'textarea', default: 'Melayani berbagai paket wisata domestik dan internasional dengan pelayanan terbaik dan harga kompetitif.' },
                    { id: 'hero_btn_primary_text', label: 'Teks Tombol Utama', type: 'text', default: '🗺️ Pesan Perjalanan' },
                    { id: 'hero_btn_primary_link', label: 'Link Tombol Utama', type: 'text', default: 'https://wa.me/6281334236869?text=Halo, saya ingin info paket travel Elyasya' },
                    { id: 'hero_btn_secondary_text', label: 'Teks Tombol Kedua', type: 'text', default: '📋 Lihat Paket' },
                ]
            },
            {
                id: 'about',
                title: 'ℹ️ About Section',
                fields: [
                    { id: 'about_subtitle', label: 'Subtitle', type: 'text', default: 'Partner perjalanan terpercaya Anda' },
                    { id: 'about_text', label: 'Deskripsi', type: 'textarea', default: 'Elyasya Travel melayani berbagai paket wisata domestik dan internasional dengan pelayanan terbaik dan harga kompetitif.' },
                ]
            },
            {
                id: 'contact',
                title: ' Contact Information',
                fields: [
                    { id: 'contact_instagram', label: 'Instagram Username', type: 'text', default: '@elyasya.travel' },
                    { id: 'contact_instagram_link', label: 'Instagram Link', type: 'text', default: 'https://instagram.com/elyasya.travel' },
                    { id: 'contact_whatsapp', label: 'WhatsApp Number', type: 'text', default: '+62 813-3423-6869' },
                    { id: 'contact_whatsapp_link', label: 'WhatsApp Link', type: 'text', default: 'https://wa.me/6281334236869' },
                    { id: 'contact_address', label: 'Alamat Kantor', type: 'textarea', default: 'Jl. KH. Ahmad Kholil Dusun Cangaan, Genteng Wetan<br>Banyuwangi, Jawa Timur 68465' },
                ]
            }
        ]
    },
    management: {
        name: 'Management',
        sections: [
            {
                id: 'hero',
                title: ' Hero Section',
                fields: [
                    { id: 'hero_badge', label: 'Badge Text', type: 'text', default: ' Management Terpercaya' },
                    { id: 'hero_title', label: 'Judul Utama', type: 'text', default: 'Elyasya <span>Management</span>' },
                    { id: 'hero_tagline', label: 'Tagline', type: 'text', default: 'Solusi manajemen bisnis profesional untuk perusahaan Anda.' },
                    { id: 'hero_description', label: 'Deskripsi', type: 'textarea', default: 'Menyediakan layanan konsultasi dan manajemen bisnis profesional untuk membantu perusahaan Anda berkembang.' },
                    { id: 'hero_btn_primary_text', label: 'Teks Tombol Utama', type: 'text', default: '💼 Konsultasi Sekarang' },
                    { id: 'hero_btn_primary_link', label: 'Link Tombol Utama', type: 'text', default: 'https://wa.me/6281334236869?text=Halo, saya ingin konsultasi management dengan Elyasya' },
                    { id: 'hero_btn_secondary_text', label: 'Teks Tombol Kedua', type: 'text', default: '📋 Lihat Layanan' },
                ]
            },
            {
                id: 'about',
                title: 'ℹ️ About Section',
                fields: [
                    { id: 'about_subtitle', label: 'Subtitle', type: 'text', default: 'Partner bisnis profesional Anda' },
                    { id: 'about_text', label: 'Deskripsi', type: 'textarea', default: 'Elyasya Management menyediakan layanan konsultasi dan manajemen bisnis profesional untuk membantu perusahaan Anda berkembang.' },
                ]
            },
            {
                id: 'contact',
                title: '📞 Contact Information',
                fields: [
                    { id: 'contact_instagram', label: 'Instagram Username', type: 'text', default: '@elyasya.management' },
                    { id: 'contact_instagram_link', label: 'Instagram Link', type: 'text', default: 'https://instagram.com/elyasya.management' },
                    { id: 'contact_whatsapp', label: 'WhatsApp Number', type: 'text', default: '+62 813-3423-6869' },
                    { id: 'contact_whatsapp_link', label: 'WhatsApp Link', type: 'text', default: 'https://wa.me/6281334236869' },
                    { id: 'contact_address', label: 'Alamat Kantor', type: 'textarea', default: 'Jl. KH. Ahmad Kholil Dusun Cangaan, Genteng Wetan<br>Banyuwangi, Jawa Timur 68465' },
                ]
            }
        ]
    },
    design: {
        name: 'Elyasya Design Interior',
        sections: [
            {
                id: 'header',
                title: '🏷️ Header Brand',
                fields: [
                    { id: 'header_sub_text', label: 'Sub Brand Text', type: 'text', default: 'Design Interior' },
                    { id: 'header_tagline', label: 'Tagline Header', type: 'text', default: 'SHAPING SPACES WITH PURPOSE' },
                ]
            },
            {
                id: 'hero',
                title: '🎯 Hero Section (Slide 1)',
                fields: [
                    { id: 'hero_tagline', label: 'Hero Tagline', type: 'text', default: 'Modern · Presisi · Elegan' },
                    { id: 'hero_title', label: 'Judul Utama', type: 'textarea', default: 'Ruangmu Bukan Sekadar Tempat Tinggal' },
                    { id: 'hero_description', label: 'Deskripsi', type: 'textarea', default: 'Ruang yang baik mampu membentuk suasana, produktivitas, dan kualitas hidup penggunanya. Kami merancang dengan presisi untuk kenyamanan jangka panjang.' },
                    { id: 'hero_meta1', label: 'Meta Badge 1', type: 'text', default: '[ Solid ]' },
                    { id: 'hero_meta2', label: 'Meta Badge 2', type: 'text', default: '[ Fungsional ]' },
                    { id: 'hero_meta3', label: 'Meta Badge 3', type: 'text', default: '[ Elegan ]' },
                ]
            },
            {
                id: 'problem',
                title: '⚠️ Problem Section (Slide 2)',
                fields: [
                    { id: 'problem_label', label: 'Label Section', type: 'text', default: '01. The Problem' },
                    { id: 'problem_title', label: 'Judul Problem', type: 'textarea', default: 'Banyak Ruang Terlihat Ada, Tapi Tidak Hidup' },
                    { id: 'problem_desc', label: 'Deskripsi Problem', type: 'textarea', default: 'Sering kali ruangan hanya diisi furnitur tanpa arah desain yang jelas. Akibatnya, ruang terasa penuh, kurang nyaman, dan tidak mencerminkan karakter pemiliknya.' },
                    { id: 'problem_card1_num', label: 'Card 1 - Nomor', type: 'text', default: '01' },
                    { id: 'problem_card1_text', label: 'Card 1 - Teks', type: 'text', default: 'Ruang sempit terasa makin sempit' },
                    { id: 'problem_card2_num', label: 'Card 2 - Nomor', type: 'text', default: '02' },
                    { id: 'problem_card2_text', label: 'Card 2 - Teks', type: 'text', default: 'Furnitur tidak menyatu' },
                    { id: 'problem_card3_num', label: 'Card 3 - Nomor', type: 'text', default: '03' },
                    { id: 'problem_card3_text', label: 'Card 3 - Teks', type: 'text', default: 'Pencahayaan kurang maksimal' },
                    { id: 'problem_card4_num', label: 'Card 4 - Nomor', type: 'text', default: '04' },
                    { id: 'problem_card4_text', label: 'Card 4 - Teks', type: 'text', default: 'Fungsi ruang tidak tertata' },
                ]
            },
            {
                id: 'pov',
                title: '💡 Point of View (Slide 3)',
                fields: [
                    { id: 'pov_label', label: 'Label Section', type: 'text', default: "02. Elyasya's Point of View" },
                    { id: 'pov_title', label: 'Judul POV', type: 'textarea', default: 'Kami Melihat Ruang Sebagai Sistem' },
                    { id: 'pov_desc', label: 'Deskripsi POV', type: 'textarea', default: 'Bagi Elyasya Design Interior, desain bukan hanya soal estetika. Setiap garis, material, warna, cahaya, dan furnitur harus memiliki fungsi serta tujuan.' },
                    { id: 'pov_quote', label: 'Quote', type: 'textarea', default: '"Desain yang baik bukan hanya terlihat indah, tapi bekerja untuk kehidupan yang lebih baik."' },
                    { id: 'gallery_label1', label: 'Gallery Label 1', type: 'text', default: 'Material' },
                    { id: 'gallery_label2', label: 'Gallery Label 2', type: 'text', default: 'Cahaya' },
                    { id: 'gallery_label3', label: 'Gallery Label 3', type: 'text', default: 'Layout' },
                    { id: 'gallery_label4', label: 'Gallery Label 4', type: 'text', default: 'Detail' },
                    { id: 'gallery_label5', label: 'Gallery Label 5', type: 'text', default: 'Permukaan' },
                    { id: 'gallery_label6', label: 'Gallery Label 6', type: 'text', default: 'Styling' },
                ]
            },
            {
                id: 'process',
                title: '⚙️ Process Section (Slide 4)',
                fields: [
                    { id: 'process_label', label: 'Label Section', type: 'text', default: '03. Our Process' },
                    { id: 'process_title', label: 'Judul Process', type: 'textarea', default: 'Dari Ide, Menjadi Ruang yang Terencana' },
                    { id: 'step1_num', label: 'Step 1 - Nomor', type: 'text', default: '01' },
                    { id: 'step1_name', label: 'Step 1 - Nama', type: 'text', default: 'Konsultasi Kebutuhan' },
                    { id: 'step2_num', label: 'Step 2 - Nomor', type: 'text', default: '02' },
                    { id: 'step2_name', label: 'Step 2 - Nama', type: 'text', default: 'Konsep Desain' },
                    { id: 'step3_num', label: 'Step 3 - Nomor', type: 'text', default: '03' },
                    { id: 'step3_name', label: 'Step 3 - Nama', type: 'text', default: 'Layout & Fungsi Ruang' },
                    { id: 'step4_num', label: 'Step 4 - Nomor', type: 'text', default: '04' },
                    { id: 'step4_name', label: 'Step 4 - Nama', type: 'text', default: 'Pemilihan Material' },
                    { id: 'step5_num', label: 'Step 5 - Nomor', type: 'text', default: '05' },
                    { id: 'step5_name', label: 'Step 5 - Nama', type: 'text', default: 'Eksekusi Interior' },
                ]
            },
            {
                id: 'outro',
                title: '📞 Outro & Contact (Slide 5)',
                fields: [
                    { id: 'outro_title', label: 'Judul Outro', type: 'textarea', default: 'Ruang yang Baik Selalu Punya Tujuan' },
                    { id: 'outro_desc', label: 'Deskripsi Outro', type: 'textarea', default: 'Konsultasikan kebutuhan interior rumah, kantor, toko, atau bangunan Anda bersama Elyasya Design Interior. Karena setiap ruang yang dirancang dengan tujuan, akan membawa hidup yang lebih bermakna.' },
                    { id: 'contact_phone', label: 'Nomor Telepon / WA', type: 'text', default: '+62 812 3456 7000' },
                    { id: 'contact_email', label: 'Email', type: 'text', default: 'info@elyasyad' },
                    { id: 'contact_website', label: 'Website', type: 'text', default: 'www.efycoxs.id' },
                ]
            }
        ]
    }
};

// Get page content from localStorage
function getPageContent(page) {
    const key = `pageContent_${page}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return {};
        }
    }
    return {};
}

// Save page content to localStorage
function savePageContent(page, content) {
    const key = `pageContent_${page}`;
    localStorage.setItem(key, JSON.stringify(content));
}

// Get field value with fallback to default
function getFieldValue(page, fieldId) {
    const content = getPageContent(page);
    if (content[fieldId] !== undefined && content[fieldId] !== '') {
        return content[fieldId];
    }
    // Find default from config
    const config = PAGE_CONTENT_CONFIG[page];
    if (config) {
        for (const section of config.sections) {
            for (const field of section.fields) {
                if (field.id === fieldId) {
                    return field.default;
                }
            }
        }
    }
    return '';
}

// Render Business Pages Menu (matching the image design)
function renderBusinessPagesMenu() {
    const businesses = [
        { id: 'index', name: 'Halaman Utama', icon: 'logo elyasya Corp.jpeg', color: '#1e3c72' },
        { id: 'design', name: 'Design Interior', icon: 'logo design interior.png', color: '#1e3c72' },
        { id: 'management', name: 'Management', icon: 'logo management.jpeg', color: '#2a5298' },
        { id: 'hijab', name: 'Hijab', icon: 'hijab logo.jpeg', color: '#8e44ad' },
        { id: 'sembako', name: 'Kedai Sembako', icon: 'logo kedai sembako.png', color: '#27ae60' },
        { id: 'travel', name: 'Travel Agent', icon: 'logo travel.jpeg', color: '#e74c3c' }
    ];

    return `
        <div class="business-pages-menu">
            ${businesses.map((biz, index) => `
                <div class="business-page-item ${index === 0 ? 'active' : ''}" onclick="navigateTo('${biz.id}')">
                    <span class="biz-icon" style="background: #ffffff; border: 2px solid ${biz.color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;"><img src="${biz.icon}" alt="${biz.name} Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;"></span>
                    <span class="biz-name">${biz.name}</span>
                    <span class="biz-arrow">›</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderBusinessPage(page) {
    const config = PAGE_CONTENT_CONFIG[page];
    if (!config) {
        return `<div class="card"><div class="card-body"><p>Page not found.</p></div></div>`;
    }

    const images = PageImages.getAllForPage(page);
    const gallery = Gallery.get(page);
    const savedContent = getPageContent(page);

    let sectionsHtml = '';
    for (const section of config.sections) {
        let fieldsHtml = '';
        for (const field of section.fields) {
            const value = getFieldValue(page, field.id);
            if (field.type === 'textarea') {
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <textarea class="form-control" id="field_${field.id}" rows="3" onchange="updatePageField('${page}', '${field.id}', this.value)">${escapeHtml(value)}</textarea>
                    </div>
                `;
            } else {
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <input type="text" class="form-control" id="field_${field.id}" value="${escapeHtml(value)}" onchange="updatePageField('${page}', '${field.id}', this.value)">
                    </div>
                `;
            }
        }

        sectionsHtml += `
            <div class="card mb-2" style="border: 1px solid var(--border-color);">
                <div class="card-header" style="cursor: pointer;" onclick="toggleSection('section_${section.id}', this)">
                    <h3 style="margin: 0;">${section.title}</h3>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="card-body" id="section_${section.id}">
                    <div class="form-row">
                        ${fieldsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="btn btn-sm btn-primary" onclick="navigateTo('business-pages')" style="display: flex; align-items: center; gap: 6px;">
                        ← Kembali
                    </button>
                    <h2 style="margin: 0;">📄 ${config.name} - Content Management</h2>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-success" onclick="saveAllPageContent('${page}')">💾 Simpan Semua</button>
                    <a href="${page === 'design' ? 'design-interior' : page}.html" target="_blank" class="btn btn-sm btn-primary"> View Page</a>
                </div>
            </div>
            <div class="card-body">
                <div class="tabs">
                    <div class="tab active" onclick="switchBusinessTab('content', this, '${page}')">✏️ Edit Konten</div>
                    <div class="tab" onclick="switchBusinessTab('images', this, '${page}')">🖼️ Images</div>
                    <div class="tab" onclick="switchBusinessTab('gallery', this, '${page}')">🎨 Gallery</div>
                </div>

                <div class="tab-content active" id="biz-tab-content-${page}">
                    ${sectionsHtml}
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <button class="btn btn-success" onclick="saveAllPageContent('${page}')">💾 Simpan Semua Perubahan</button>
                        <button class="btn btn-warning" onclick="resetPageContent('${page}')">🔄 Reset ke Default</button>
                    </div>
                </div>

                <div class="tab-content" id="biz-tab-images-${page}">
                    <h3 class="mb-1">Page Images</h3>
                    <p class="text-muted mb-2">Kelola gambar halaman di Page Images.</p>
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
                </div>

                <div class="tab-content" id="biz-tab-gallery-${page}">
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
        </div>
    `;
}

function initBusinessPage(page) {
    // Page is static, no additional init needed
}

function switchBusinessTab(tab, element, page) {
    const parent = element.closest('.card-body');
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    parent.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(`biz-tab-${tab}-${page}`).classList.add('active');
}

function toggleSection(sectionId, headerEl) {
    const section = document.getElementById(sectionId);
    const icon = headerEl.querySelector('.toggle-icon');
    if (section.style.display === 'none') {
        section.style.display = 'block';
        icon.textContent = '▼';
    } else {
        section.style.display = 'none';
        icon.textContent = '▶';
    }
}

function updatePageField(page, fieldId, value) {
    const content = getPageContent(page);
    content[fieldId] = value;
    savePageContent(page, content);
}

function saveAllPageContent(page) {
    const config = PAGE_CONTENT_CONFIG[page];
    if (!config) return;

    const content = {};
    for (const section of config.sections) {
        for (const field of section.fields) {
            const el = document.getElementById(`field_${field.id}`);
            if (el) {
                content[field.id] = el.value;
            }
        }
    }

    savePageContent(page, content);
    showToast(`Konten ${config.name} berhasil disimpan!`, 'success');
}

function resetPageContent(page) {
    if (!confirm(`Reset semua konten ${PAGE_CONTENT_CONFIG[page].name} ke default?`)) return;
    
    localStorage.removeItem(`pageContent_${page}`);
    showToast('Konten berhasil direset ke default!', 'warning');
    navigateTo(page);
}

// ==========================================
// LINI BISINIS KAMI PAGE MANAGEMENT
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

// Render sel icon untuk tabel admin (thumbnail gambar atau emoji)
function renderLiniBisnisIconCell(item) {
    const r = resolveLiniBisnisIcon(item);
    if (r.type === 'image') {
        return '<img src="' + escapeHtml(r.src) + '" alt="Logo" style="width:42px;height:42px;object-fit:contain;border-radius:8px;border:1px solid #eee;background:#fff;">';
    }
    return '<span style="font-size:24px;">' + escapeHtml(r.value) + '</span>';
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

function saveLiniBisnisData(data) {
    localStorage.setItem('liniBisnisData', JSON.stringify(data));
}

function renderLiniBisnisPage() {
    const items = getLiniBisnisData();
    
    return `
        <div class="card">
            <div class="card-header">
                <h2>🏢 Lini Bisnis Kami</h2>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-primary" onclick="showAddLiniBisnisModal()">➕ Tambah Lini Bisnis</button>
                    <button class="btn btn-sm btn-warning" onclick="resetLiniBisnis()">🔄 Reset ke Default</button>
                </div>
            </div>
            <div class="card-body">
                <p class="text-muted mb-2">Kelola daftar lini bisnis yang tampil di halaman utama (index.html) pada section "Lini Bisnis Kami".</p>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Urutan</th>
                                <th>Icon</th>
                                <th>Nama Bisnis</th>
                                <th>Deskripsi</th>
                                <th>Fitur</th>
                                <th>Tombol</th>
                                <th>Link</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="liniBisnisTableBody">
                            ${items.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${renderLiniBisnisIconCell(item)}</td>
                                    <td><strong>${escapeHtml(item.title)}</strong></td>
                                    <td>${escapeHtml(item.description).substring(0, 50)}...</td>
                                    <td>${(item.features || []).map(f => '✓ ' + escapeHtml(f)).join('<br>')}</td>
                                    <td>${escapeHtml(item.buttonText || '-')}</td>
                                    <td><code>${item.link}</code></td>
                                    <td>
                                        <span class="badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}">
                                            ${item.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td class="actions">
                                        <button class="btn btn-sm btn-primary" onclick="showEditLiniBisnisModal(${item.id})">✏️ Edit</button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteLiniBisnis(${item.id})">🗑️ Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function initLiniBisnisPage() {
    // Table is already rendered inline
}

function showAddLiniBisnisModal() {
    const body = `
        <form id="liniBisnisForm" onsubmit="saveLiniBisnisItem(event)">
            <input type="hidden" id="liniBisnisId" value="">
            <div class="form-row">
                <div class="form-group">
                    <label>Icon (Path/URL Gambar atau Emoji)</label>
                    <input type="text" class="form-control" id="liniBisnisIcon" list="liniBisnisIconList" placeholder="contoh: logo travel.jpeg">
                    <datalist id="liniBisnisIconList">
                        <option value="logo design interior.png">
                        <option value="logo management.jpeg">
                        <option value="hijab logo.jpeg">
                        <option value="logo kedai sembako.png">
                        <option value="logo travel.jpeg">
                    </datalist>
                    <small class="text-muted">Isi path/URL gambar logo, atau biarkan kosong untuk mengikuti logo halaman.</small>
                </div>
                <div class="form-group">
                    <label>Warna (Hex) *</label>
                    <input type="color" class="form-control" id="liniBisnisColor" value="#2a5298" style="height: 42px;">
                </div>
            </div>
            <div class="form-group">
                <label>Nama Bisnis *</label>
                <input type="text" class="form-control" id="liniBisnisTitle" required>
            </div>
            <div class="form-group">
                <label>Deskripsi *</label>
                <textarea class="form-control" id="liniBisnisDescription" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label>Fitur 1 (tanpa tanda ✓)</label>
                <input type="text" class="form-control" id="liniBisnisFeature1" placeholder="contoh: Konsultasi Gratis">
            </div>
            <div class="form-group">
                <label>Fitur 2</label>
                <input type="text" class="form-control" id="liniBisnisFeature2" placeholder="contoh: Portfolio 100+ Proyek">
            </div>
            <div class="form-group">
                <label>Fitur 3</label>
                <input type="text" class="form-control" id="liniBisnisFeature3" placeholder="contoh: Garansi Kepuasan">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Teks Tombol *</label>
                    <input type="text" class="form-control" id="liniBisnisButtonText" placeholder="contoh: Lihat Portfolio" required>
                </div>
                <div class="form-group">
                    <label>Link Halaman *</label>
                    <input type="text" class="form-control" id="liniBisnisLink" placeholder="contoh: hijab.html" required>
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select class="form-control" id="liniBisnisStatus">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-danger" onclick="closeModal()">Batal</button>
        <button class="btn btn-success" onclick="document.getElementById('liniBisnisForm').requestSubmit()">💾 Simpan</button>
    `;

    showModal('Tambah Lini Bisnis', body, footer);
}

function showEditLiniBisnisModal(id) {
    const items = getLiniBisnisData();
    const item = items.find(i => i.id === id);
    if (!item) return;

    showAddLiniBisnisModal();
    
    const features = item.features || [];
    document.getElementById('liniBisnisId').value = item.id;
    document.getElementById('liniBisnisIcon').value = item.icon;
    document.getElementById('liniBisnisColor').value = item.color;
    document.getElementById('liniBisnisTitle').value = item.title;
    document.getElementById('liniBisnisDescription').value = item.description;
    document.getElementById('liniBisnisFeature1').value = features[0] || '';
    document.getElementById('liniBisnisFeature2').value = features[1] || '';
    document.getElementById('liniBisnisFeature3').value = features[2] || '';
    document.getElementById('liniBisnisButtonText').value = item.buttonText || '';
    document.getElementById('liniBisnisLink').value = item.link;
    document.getElementById('liniBisnisStatus').value = item.status;

    document.getElementById('modalTitle').textContent = 'Edit Lini Bisnis';
}

function saveLiniBisnisItem(event) {
    event.preventDefault();

    const id = document.getElementById('liniBisnisId').value;
    const items = getLiniBisnisData();

    // Build features array from 3 input fields
    const features = [];
    const f1 = document.getElementById('liniBisnisFeature1').value.trim();
    const f2 = document.getElementById('liniBisnisFeature2').value.trim();
    const f3 = document.getElementById('liniBisnisFeature3').value.trim();
    if (f1) features.push(f1);
    if (f2) features.push(f2);
    if (f3) features.push(f3);

    const itemData = {
        icon: document.getElementById('liniBisnisIcon').value,
        color: document.getElementById('liniBisnisColor').value,
        title: document.getElementById('liniBisnisTitle').value,
        description: document.getElementById('liniBisnisDescription').value,
        features: features,
        buttonText: document.getElementById('liniBisnisButtonText').value,
        link: document.getElementById('liniBisnisLink').value,
        status: document.getElementById('liniBisnisStatus').value
    };

    if (id) {
        // Update existing
        const index = items.findIndex(i => i.id === parseInt(id));
        if (index !== -1) {
            items[index] = { ...items[index], ...itemData };
        }
        showToast('Lini bisnis berhasil diupdate!', 'success');
    } else {
        // Add new
        itemData.id = Date.now();
        items.push(itemData);
        showToast('Lini bisnis baru berhasil ditambahkan!', 'success');
    }

    saveLiniBisnisData(items);
    closeModal();
    navigateTo('lini-bisnis');
}

function deleteLiniBisnis(id) {
    if (!confirm('Hapus lini bisnis ini?')) return;
    
    let items = getLiniBisnisData();
    items = items.filter(i => i.id !== id);
    saveLiniBisnisData(items);
    showToast('Lini bisnis berhasil dihapus!', 'success');
    navigateTo('lini-bisnis');
}

function resetLiniBisnis() {
    if (!confirm('Reset semua lini bisnis ke default?')) return;
    
    saveLiniBisnisData(LINI_BISNIS_DEFAULT);
    showToast('Lini bisnis berhasil direset ke default!', 'warning');
    navigateTo('lini-bisnis');
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
        await Messages.init();
        
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