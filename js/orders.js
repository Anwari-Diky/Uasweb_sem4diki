// js/orders.js
import { StateManager } from './state.js';
import { API } from './api.js';

export class OrderManager {
  static async getOrders() {
    try {
      const data = await API.get('/orders');
      return data;
    } catch (error) {
      console.error('Failed to get orders:', error);
      return [];
    }
  }

  static async checkout(items, totalHarga, pengiriman) {
    try {
      const response = await API.post('/orders/checkout', { items, totalHarga, pengiriman });
      return response; // Contains orderId, whatsappUrl, message
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  static async renderOrders(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '<div class="py-8 text-center"><p class="text-gray-500">Memuat pesanan...</p></div>';

    const orders = await this.getOrders();

    if (orders.length === 0) {
      containerEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">Belum ada riwayat pesanan</p>
          <a href="index.html" class="mt-4 text-blue-500 hover:text-blue-600 font-medium transition-colors">Mulai belanja</a>
        </div>
      `;
      return;
    }

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    containerEl.innerHTML = orders.map(order => {
      const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Diproses': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Selesai': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      };

      return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer order-card" data-order-id="${order.id}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Transaksi</p>
              <p class="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">${order.id}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || statusColors['Pending']} w-fit">
              ${order.status}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm mb-3">
            <span class="text-gray-500 dark:text-gray-400">${this.formatDate(order.created_at || order.createdAt)}</span>
            <span class="text-gray-600 dark:text-gray-300">${order.items?.length || 0} item</span>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pembayaran</span>
            <span class="text-lg font-bold text-blue-500">${formatRupiah(order.total_harga || order.totalHarga)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  static async showOrderDetail(orderId) {
    const orders = await this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Diproses': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Selesai': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };

    const modalHTML = `
      <div id="order-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
          <button id="close-order-modal" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Detail Pesanan</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Transaksi</p>
                  <p class="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">${order.id}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || statusColors['Pending']}">${order.status}</span>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Pemesanan</p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-100">${this.formatDate(order.created_at || order.createdAt)}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Produk yang Dibeli</h3>
                <div class="space-y-2">
                  ${(order.items || []).map(item => `
                    <div class="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div class="flex-1">
                        <p class="font-medium text-gray-800 dark:text-gray-100">${item.nama}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${item.quantity} x ${formatRupiah(item.harga)}</p>
                      </div>
                      <p class="font-semibold text-gray-700 dark:text-gray-300">${formatRupiah(item.subtotal)}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Informasi Pengiriman</h3>
                <div class="text-sm space-y-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-gray-800 dark:text-gray-100"><span class="font-medium text-gray-600 dark:text-gray-400">Nama:</span> ${order.pengiriman?.namaLengkap || order.nama_lengkap}</p>
                  <p class="text-gray-800 dark:text-gray-100"><span class="font-medium text-gray-600 dark:text-gray-400">Alamat:</span> ${order.pengiriman?.alamat || order.alamat}</p>
                  <p class="text-gray-800 dark:text-gray-100"><span class="font-medium text-gray-600 dark:text-gray-400">No. HP:</span> ${order.pengiriman?.nomorHP || order.nomor_hp}</p>
                </div>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span class="text-base font-semibold text-gray-700 dark:text-gray-300">Total Pembayaran</span>
                <span class="text-2xl font-bold text-blue-500">${formatRupiah(order.total_harga || order.totalHarga)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('overflow-hidden');

    document.getElementById('close-order-modal')?.addEventListener('click', () => {
      document.getElementById('order-modal')?.remove();
      document.body.classList.remove('overflow-hidden');
    });

    document.getElementById('order-modal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('order-modal')?.remove();
        document.body.classList.remove('overflow-hidden');
      }
    });
  }

  static formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
