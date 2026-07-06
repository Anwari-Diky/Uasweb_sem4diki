import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';
import { CartManager } from './cart.js';
import { ProductManager } from './product.js';
import { AdminManager } from './admin.js';

ThemeManager.init();
if (!AuthManager.requireAuth()) throw new Error('Not authenticated');
if (!AuthManager.isAdmin()) {
  window.location.href = 'index.html';
  throw new Error('Not admin');
}

const currentUser = AuthManager.getCurrentUser();
document.getElementById('user-name').textContent = currentUser.nama;

document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
document.getElementById('logout-btn')?.addEventListener('click', () => AuthManager.logout());

async function init() {
  await CartManager.updateCartBadge();
  await loadAndRenderTable();
}

init();

const tableContainer = document.getElementById('product-table-container');

async function loadAndRenderTable() {
  await AdminManager.renderProductTable(tableContainer);
  attachTableEvents();
}

function attachTableEvents() {
  tableContainer?.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await AdminManager.showProductForm(btn.dataset.productId);
    });
  });

  tableContainer?.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AdminManager.confirmDelete(btn.dataset.productId, async () => {
        await loadAndRenderTable();
        Toast.success('Produk berhasil dihapus!');
      });
    });
  });
}

document.getElementById('add-product-btn')?.addEventListener('click', async () => {
  await AdminManager.showProductForm(null);
});

// Listen for product changes to re-render table
window.addEventListener('product-changed', async () => {
  await loadAndRenderTable();
  Toast.success('Daftar produk berhasil diperbarui!');
});

// Tab Navigation Logic
const tabBtns = {
  produk: document.getElementById('tab-btn-produk'),
  pesanan: document.getElementById('tab-btn-pesanan'),
  modul: document.getElementById('tab-btn-modul')
};

const tabContents = {
  produk: document.getElementById('tab-produk'),
  pesanan: document.getElementById('tab-pesanan'),
  modul: document.getElementById('tab-modul')
};

async function switchTab(activeTab) {
  Object.keys(tabBtns).forEach(tab => {
    if (tab === activeTab) {
      tabBtns[tab]?.classList.add('text-blue-700', 'bg-blue-50', 'dark:text-blue-400', 'dark:bg-blue-900/30');
      tabBtns[tab]?.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
      tabContents[tab]?.classList.remove('hidden');
    } else {
      tabBtns[tab]?.classList.remove('text-blue-700', 'bg-blue-50', 'dark:text-blue-400', 'dark:bg-blue-900/30');
      tabBtns[tab]?.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
      tabContents[tab]?.classList.add('hidden');
    }
  });

  if (activeTab === 'pesanan') {
    await AdminManager.renderOrdersTable(document.getElementById('admin-orders-container'));
  }
}

tabBtns.produk?.addEventListener('click', () => switchTab('produk'));
tabBtns.pesanan?.addEventListener('click', () => switchTab('pesanan'));
tabBtns.modul?.addEventListener('click', () => switchTab('modul'));

// --- Banner Upload Logic ---
import { API } from './api.js';

const bannerForm = document.getElementById('banner-form');
const bannerInput = document.getElementById('banner-upload');
const bannerPreview = document.getElementById('banner-preview');
const bannerPlaceholder = document.getElementById('banner-placeholder');
const bannerOverlay = document.getElementById('banner-overlay');
const saveBannerBtn = document.getElementById('save-banner-btn');

async function loadCurrentBanner() {
  try {
    const res = await API.get('/settings/banner');
    if (res && res.url) {
      bannerPreview.src = res.url;
      bannerPreview.classList.remove('hidden');
      bannerPlaceholder.classList.add('hidden');
      bannerOverlay.classList.remove('hidden');
      bannerOverlay.classList.add('flex');
    }
  } catch (err) {
    console.error('Failed to load banner:', err);
  }
}

bannerInput?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      bannerPreview.src = e.target.result;
      bannerPreview.classList.remove('hidden');
      bannerPlaceholder.classList.add('hidden');
      bannerOverlay.classList.remove('hidden');
      bannerOverlay.classList.add('flex');
    }
    reader.readAsDataURL(file);
  }
});

bannerForm?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const file = bannerInput.files[0];
  if (!file && !bannerPreview.src) {
    Toast.error('Pilih gambar terlebih dahulu!');
    return;
  }
  
  if (!file) {
    Toast.success('Tidak ada perubahan gambar.');
    return;
  }

  const formData = new FormData();
  formData.append('banner', file);

  try {
    saveBannerBtn.disabled = true;
    saveBannerBtn.innerHTML = 'Menyimpan...';
    
    await API.post('/settings/banner', formData);
    Toast.success('Banner berhasil diperbarui!');
    
  } catch (err) {
    Toast.error(err.message || 'Gagal menyimpan banner');
  } finally {
    saveBannerBtn.disabled = false;
    saveBannerBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      Simpan Banner
    `;
  }
});

// Load banner when modul tab is opened
tabBtns.modul?.addEventListener('click', () => {
    loadCurrentBanner();
});
