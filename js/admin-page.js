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
document.getElementById('user-name-mobile').textContent = currentUser.nama;
document.getElementById('admin-link')?.classList.remove('hidden');
document.getElementById('admin-link-mobile')?.classList.remove('hidden');

document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
document.getElementById('hamburger-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.toggle('hidden');
});
document.getElementById('logout-btn')?.addEventListener('click', () => AuthManager.logout());
document.getElementById('logout-btn-mobile')?.addEventListener('click', () => AuthManager.logout());

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
      tabBtns[tab].classList.add('text-blue-600', 'dark:text-blue-400', 'border-blue-600', 'dark:border-blue-400');
      tabBtns[tab].classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
      tabContents[tab].classList.remove('hidden');
    } else {
      tabBtns[tab].classList.remove('text-blue-600', 'dark:text-blue-400', 'border-blue-600', 'dark:border-blue-400');
      tabBtns[tab].classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
      tabContents[tab].classList.add('hidden');
    }
  });

  if (activeTab === 'pesanan') {
    await AdminManager.renderOrdersTable(document.getElementById('admin-orders-container'));
  }
}

tabBtns.produk?.addEventListener('click', () => switchTab('produk'));
tabBtns.pesanan?.addEventListener('click', () => switchTab('pesanan'));
tabBtns.modul?.addEventListener('click', () => switchTab('modul'));
