// js/admin.js
import { StateManager } from './state.js';
import { ProductManager } from './product.js';
import { OrderManager } from './orders.js';
import { API } from './api.js';

export class AdminManager {
  static async renderProductTable(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '<div class="py-8 text-center"><p class="text-gray-500">Memuat produk...</p></div>';

    const products = await ProductManager.loadProducts();

    if (products.length === 0) {
      containerEl.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada produk</p>';
      return;
    }

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    containerEl.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Produk</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Kategori</th>
              <th class="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Harga</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Stok</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            ${products.map(p => `
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img src="${p.gambar}" alt="${p.nama}" class="w-10 h-10 object-cover rounded-lg" onerror="this.src='https://placehold.co/40x40?text=No'">
                    <span class="font-medium text-gray-800 dark:text-gray-100 line-clamp-1">${p.nama}</span>
                  </div>
                </td>
                <td class="py-3 px-4 hidden sm:table-cell">
                  <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">${p.kategori}</span>
                </td>
                <td class="py-3 px-4 text-right font-semibold text-gray-700 dark:text-gray-300">${formatRupiah(p.harga)}</td>
                <td class="py-3 px-4 text-center hidden md:table-cell text-gray-600 dark:text-gray-400">${p.stok}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center justify-center gap-2">
                    <button class="edit-btn px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors" data-product-id="${p.id}">Edit</button>
                    <button class="delete-btn px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" data-product-id="${p.id}">Hapus</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  static async renderOrdersTable(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '<div class="py-8 text-center"><p class="text-gray-500">Memuat pesanan...</p></div>';

    const orders = await OrderManager.getOrders();

    if (orders.length === 0) {
      containerEl.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-8 text-center">
          <p class="text-gray-500 dark:text-gray-400">Belum ada pesanan masuk</p>
        </div>
      `;
      return;
    }

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    
    const formatDate = (isoString) => new Date(isoString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Diproses': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Selesai': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };

    containerEl.innerHTML = orders.map(order => `
      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600 flex flex-col gap-3">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">ID: <span class="font-mono text-gray-800 dark:text-gray-200">${order.id}</span></p>
            <p class="text-sm font-medium text-gray-800 dark:text-gray-100">${order.pengiriman.namaLengkap}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[order.status] || statusColors['Pending']} uppercase tracking-wider">${order.status}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">${formatDate(order.created_at || order.createdAt)}</span>
          <span class="font-bold text-blue-500">${formatRupiah(order.total_harga || order.totalHarga)}</span>
        </div>
      </div>
    `).join('');
  }

  static async showProductForm(productId = null) {
    let product = null;
    if (productId) {
      product = ProductManager.getProductById(productId);
    }
    const isEdit = !!product;

    const modalHTML = `
      <div id="product-form-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">${isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <button id="close-product-form" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form id="product-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Produk</label>
                <input id="pf-nama" type="text" value="${product?.nama || ''}" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga (Rp)</label>
                <input id="pf-harga" type="number" value="${product?.harga || ''}" min="0" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select id="pf-kategori" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="Sepatu Bola" ${product?.kategori === 'Sepatu Bola' ? 'selected' : ''}>Sepatu Bola</option>
                  <option value="Sepatu Futsal" ${product?.kategori === 'Sepatu Futsal' ? 'selected' : ''}>Sepatu Futsal</option>
                  <option value="Sepatu Lari" ${product?.kategori === 'Sepatu Lari' ? 'selected' : ''}>Sepatu Lari</option>
                  <option value="Aksesoris" ${product?.kategori === 'Aksesoris' ? 'selected' : ''}>Aksesoris</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Gambar</label>
                <input id="pf-gambar" type="file" accept="image/*" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                ${isEdit && product?.gambar ? `<p class="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah gambar.</p><input type="hidden" id="pf-gambar-lama" value="${product.gambar}">` : ''}
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea id="pf-deskripsi" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">${product?.deskripsi || ''}</textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok</label>
                  <input id="pf-stok" type="number" value="${product?.stok || 0}" min="0" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating (1-5)</label>
                  <input id="pf-rating" type="number" value="${product?.rating || 4.0}" min="1" max="5" step="0.1" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-colors">
                  ${isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
                <button type="button" id="cancel-product-form" class="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('overflow-hidden');

    const closeModal = () => {
      document.getElementById('product-form-modal')?.remove();
      document.body.classList.remove('overflow-hidden');
    };

    document.getElementById('close-product-form')?.addEventListener('click', closeModal);
    document.getElementById('cancel-product-form')?.addEventListener('click', closeModal);

    document.getElementById('product-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Menyimpan...';
      submitBtn.disabled = true;

      const formData = new FormData();
      formData.append('nama', document.getElementById('pf-nama').value.trim());
      formData.append('harga', document.getElementById('pf-harga').value);
      formData.append('kategori', document.getElementById('pf-kategori').value);
      formData.append('deskripsi', document.getElementById('pf-deskripsi').value.trim());
      formData.append('stok', document.getElementById('pf-stok').value);
      formData.append('rating', document.getElementById('pf-rating').value);

      const fileInput = document.getElementById('pf-gambar');
      if (fileInput.files.length > 0) {
        formData.append('gambar', fileInput.files[0]);
      } else {
        const gambarLama = document.getElementById('pf-gambar-lama');
        if (gambarLama) {
          formData.append('gambar', gambarLama.value);
        }
      }
      
      try {
        await this.saveProduct(formData, productId);
        closeModal();
        // Dispatch event so UI can reload
        window.dispatchEvent(new Event('product-changed'));
      } catch (error) {
        alert('Gagal menyimpan produk: ' + error.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  static async saveProduct(formData, productId = null) {
    if (productId) {
      await API.put(`/products/${productId}`, formData);
    } else {
      await API.post('/products', formData);
    }
  }

  static confirmDelete(productId, onConfirm) {
    const modalHTML = `
      <div id="delete-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Hapus Produk</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
          <div class="flex gap-3">
            <button id="confirm-delete-btn" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Hapus</button>
            <button id="cancel-delete-btn" class="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Batal</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('overflow-hidden');

    const closeModal = () => {
      document.getElementById('delete-modal')?.remove();
      document.body.classList.remove('overflow-hidden');
    };

    document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('confirm-delete-btn');
      btn.textContent = 'Menghapus...';
      btn.disabled = true;
      try {
        await this.deleteProduct(productId);
        closeModal();
        if (onConfirm) onConfirm();
      } catch (error) {
        alert('Gagal menghapus produk: ' + error.message);
        closeModal();
      }
    });

    document.getElementById('cancel-delete-btn')?.addEventListener('click', closeModal);
  }

  static async deleteProduct(productId) {
    await API.delete(`/products/${productId}`);
  }
}
