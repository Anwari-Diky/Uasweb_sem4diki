// js/search.js
export class SearchFilter {
  constructor(allProducts, onFilterChange) {
    this._allProducts = allProducts;
    this._onFilterChange = onFilterChange;
    this._keyword = '';
    this._category = '';
    this._minPrice = null;
    this._maxPrice = null;
  }

  applyFilters() {
    let filtered = [...this._allProducts];

    if (this._keyword) {
      const kw = this._keyword.toLowerCase();
      filtered = filtered.filter(p =>
        p.nama.toLowerCase().includes(kw) ||
        p.deskripsi.toLowerCase().includes(kw)
      );
    }

    if (this._category) {
      filtered = filtered.filter(p => p.kategori === this._category);
    }

    if (this._minPrice !== null && !isNaN(this._minPrice)) {
      filtered = filtered.filter(p => p.harga >= this._minPrice);
    }

    if (this._maxPrice !== null && !isNaN(this._maxPrice)) {
      filtered = filtered.filter(p => p.harga <= this._maxPrice);
    }

    this._onFilterChange(filtered);
  }

  setKeyword(keyword) {
    this._keyword = keyword.trim();
    this.applyFilters();
  }

  setCategory(category) {
    this._category = category;
    this.applyFilters();
  }

  setPriceRange(min, max) {
    this._minPrice = min !== '' && min !== null ? Number(min) : null;
    this._maxPrice = max !== '' && max !== null ? Number(max) : null;
    this.applyFilters();
  }

  reset() {
    this._keyword = '';
    this._category = '';
    this._minPrice = null;
    this._maxPrice = null;
    this.applyFilters();
  }

  static getCategories(products) {
    const cats = [...new Set(products.map(p => p.kategori))];
    return cats.sort();
  }
}
