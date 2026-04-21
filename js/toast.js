// js/toast.js
export class Toast {
  static success(message, duration = 3000) {
    this._show(message, 'success', duration);
  }

  static warning(message, duration = 3000) {
    this._show(message, 'warning', duration);
  }

  static error(message, duration = 3000) {
    this._show(message, 'error', duration);
  }

  static _show(message, type, duration) {
    const colors = {
      success: 'bg-emerald-500 text-white',
      warning: 'bg-amber-400 text-white',
      error: 'bg-red-500 text-white',
    };

    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
    };

    // Create container if not exists
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-64 max-w-sm ${colors[type]} transform translate-x-full opacity-0 transition-all duration-300`;
    toast.innerHTML = `
      <span class="text-lg font-bold">${icons[type]}</span>
      <span class="text-sm font-medium flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-white opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
      });
    });

    // Auto dismiss
    setTimeout(() => this._dismiss(toast), duration);
  }

  static _dismiss(toastEl) {
    if (!toastEl || !toastEl.parentElement) return;
    toastEl.classList.remove('translate-x-0', 'opacity-100');
    toastEl.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (toastEl.parentElement) toastEl.remove();
    }, 300);
  }
}
