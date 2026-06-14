// Admin Dashboard Script - Elyasya Corp

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

// CRUD Operations for Slides
function addSlide() {
    showAddModal('slide');
}

function editSlide(id) {
    showEditModal('slide', id);
}

function deleteSlide(id) {
    confirmDelete('slide', id);
}

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

// Initialize image loading on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    loadSavedImages();
});

// Console welcome message
console.log('%c Elyasya Corp Admin Dashboard ', 'background: #1e3c72; color: white; font-size: 16px; padding: 10px;');
console.log('Dashboard initialized successfully!');
