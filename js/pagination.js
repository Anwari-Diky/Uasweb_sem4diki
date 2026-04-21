// js/pagination.js
export class PaginationManager {
  constructor(itemsPerPage = 8) {
    this._items = [];
    this._currentPage = 1;
    this._itemsPerPage = itemsPerPage;
  }

  setItems(items) {
    this._items = items;
    this._currentPage = 1;
  }

  getCurrentPageItems() {
    const start = (this._currentPage - 1) * this._itemsPerPage;
    const end = start + this._itemsPerPage;
    return this._items.slice(start, end);
  }

  goToPage(pageNumber) {
    const total = this.getTotalPages();
    if (pageNumber < 1 || pageNumber > total) return;
    this._currentPage = pageNumber;
  }

  getTotalPages() {
    return Math.ceil(this._items.length / this._itemsPerPage);
  }

  getCurrentPage() {
    return this._currentPage;
  }

  renderControls(containerEl, onPageChange) {
    const total = this.getTotalPages();

    if (total <= 1) {
      containerEl.innerHTML = '';
      return;
    }

    const current = this._currentPage;
    let html = '<div class="flex items-center justify-center gap-2 mt-8">';

    // Previous button
    html += `
      <button
        class="pagination-btn px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${current === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}"
        data-page="${current - 1}"
        ${current === 1 ? 'disabled' : ''}
      >
        &laquo; Sebelumnya
      </button>
    `;

    // Page numbers
    const pages = this._getPageNumbers(current, total);
    pages.forEach(page => {
      if (page === '...') {
        html += '<span class="px-2 text-gray-400">...</span>';
      } else {
        html += `
          <button
            class="pagination-btn w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-200 ${page === current ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}"
            data-page="${page}"
          >
            ${page}
          </button>
        `;
      }
    });

    // Next button
    html += `
      <button
        class="pagination-btn px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${current === total ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}"
        data-page="${current + 1}"
        ${current === total ? 'disabled' : ''}
      >
        Berikutnya &raquo;
      </button>
    `;

    html += '</div>';
    containerEl.innerHTML = html;

    // Attach event listeners
    containerEl.querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        this.goToPage(page);
        onPageChange(page);
      });
    });
  }

  _getPageNumbers(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
    return pages;
  }
}
