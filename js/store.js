const Store = {
  data: null,
  _listeners: [],
  _key: 'myitemvault',

  _defaults() {
    var now = new Date().toISOString().split('T')[0];
    return {
      categories: [
        { id: 'cat-1', name: 'Electrónica', icon: '⚡' },
        { id: 'cat-2', name: 'Audio', icon: '🎧' },
        { id: 'cat-3', name: 'Periféricos', icon: '🖱️' },
        { id: 'cat-4', name: 'Accesorios', icon: '💍' },
      ],
      items: [
        { id: 'item-1', name: 'Smartphone Misterioso', categoryId: 'cat-1', rarity: 'rare', quantity: 1, price: '599.99', currency: 'USD', acquiredFrom: 'Tienda Online', acquiredDate: now, description: 'Un smartphone de origen desconocido con poderes ocultos. +50 a productividad.', imageUrl: '', createdAt: now },
        { id: 'item-2', name: 'Auriculares Runáticos', categoryId: 'cat-2', rarity: 'epic', quantity: 1, price: '129.990', currency: 'CLP', acquiredFrom: 'MercadoLibre', acquiredDate: now, description: 'Cancelación de ruido mágica. Te transportan a otro mundo. +100 a concentración.', imageUrl: '', createdAt: now },
        { id: 'item-3', name: 'Ratón del Caos', categoryId: 'cat-3', rarity: 'legendary', quantity: 1, price: '89.990', currency: 'CLP', acquiredFrom: 'Amazon', acquiredDate: now, description: 'Botones programables con poderes arcanos. +30 de daño por clic.', imageUrl: '', createdAt: now },
        { id: 'item-4', name: 'Funda Élfica', categoryId: 'cat-4', rarity: 'uncommon', quantity: 2, price: '25.99', currency: 'USD', acquiredFrom: 'Tienda física', acquiredDate: now, description: 'Fabricada con materiales místicos. Protege tu equipo del daño mundano.', imageUrl: '', createdAt: now },
      ],
      nextCategoryId: 5,
      nextItemId: 5,
    };
  },

  init() {
    const saved = localStorage.getItem(this._key);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        if (!this.data.categories) this.data.categories = [];
        if (!this.data.items) this.data.items = [];
      } catch {
        this.data = this._defaults();
      }
    } else {
      this.data = this._defaults();
    }
    this.data.items = (this.data.items || []).map(function (i) {
      if (i.price === undefined) i.price = '';
      if (i.currency === undefined) i.currency = 'CLP';
      if (i.acquiredFrom === undefined) i.acquiredFrom = '';
      return i;
    });
    this.save();
  },

  save() {
    localStorage.setItem(this._key, JSON.stringify(this.data));
    this._notify();
  },

  _notify() {
    this._listeners.forEach(fn => { try { fn(); } catch {} });
  },

  onChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(f => f !== fn);
    };
  },

  getCategories() {
    return this.data.categories;
  },

  getCategory(id) {
    return this.data.categories.find(c => c.id === id);
  },

  addCategory(name, icon) {
    const id = 'cat-' + (this.data.nextCategoryId++);
    this.data.categories.push({ id, name, icon: icon || '📦' });
    this.save();
    return id;
  },

  updateCategory(id, name, icon) {
    const cat = this.getCategory(id);
    if (!cat) return;
    if (name) cat.name = name;
    if (icon) cat.icon = icon;
    this.save();
  },

  deleteCategory(id) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.data.items = this.data.items.filter(i => i.categoryId !== id);
    this.save();
  },

  getItems() {
    return this.data.items;
  },

  getItem(id) {
    return this.data.items.find(i => i.id === id);
  },

  addItem(data) {
    const id = 'item-' + (this.data.nextItemId++);
    const item = {
      id,
      name: data.name,
      categoryId: data.categoryId,
      rarity: data.rarity || 'common',
      quantity: Math.max(1, parseInt(data.quantity) || 1),
      description: data.description || '',
      price: data.price || '',
      currency: data.currency || 'CLP',
      acquiredFrom: data.acquiredFrom || '',
      acquiredDate: data.acquiredDate || new Date().toISOString().split('T')[0],
      imageUrl: data.imageUrl || '',
      createdAt: new Date().toISOString(),
    };
    this.data.items.push(item);
    this.save();
    return id;
  },

  updateItem(id, data) {
    const idx = this.data.items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    const item = this.data.items[idx];
    if (data.name !== undefined) item.name = data.name;
    if (data.categoryId !== undefined) item.categoryId = data.categoryId;
    if (data.rarity !== undefined) item.rarity = data.rarity;
    if (data.quantity !== undefined) item.quantity = Math.max(1, parseInt(data.quantity) || 1);
    if (data.price !== undefined) item.price = data.price;
    if (data.currency !== undefined) item.currency = data.currency;
    if (data.acquiredFrom !== undefined) item.acquiredFrom = data.acquiredFrom;
    if (data.acquiredDate !== undefined) item.acquiredDate = data.acquiredDate;
    if (data.description !== undefined) item.description = data.description;
    if (data.imageUrl !== undefined) item.imageUrl = data.imageUrl;
    this.save();
    return true;
  },

  duplicateItem(id) {
    var original = this.getItem(id);
    if (!original) return null;
    var newId = 'item-' + (this.data.nextItemId++);
    var dup = JSON.parse(JSON.stringify(original));
    dup.id = newId;
    dup.name = original.name + ' (copia)';
    dup.createdAt = new Date().toISOString();
    var idx = this.data.items.findIndex(function (i) { return i.id === id; });
    this.data.items.splice(idx + 1, 0, dup);
    this.save();
    return newId;
  },

  moveItem(itemId, targetItemId) {
    var fromIdx = this.data.items.findIndex(function (i) { return i.id === itemId; });
    var toIdx = this.data.items.findIndex(function (i) { return i.id === targetItemId; });
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    if (fromIdx < toIdx) toIdx--;
    var item = this.data.items.splice(fromIdx, 1)[0];
    this.data.items.splice(toIdx, 0, item);
    this.save();
  },

  moveItemToIndex(itemId, toIndex) {
    var fromIdx = this.data.items.findIndex(function (i) { return i.id === itemId; });
    if (fromIdx === -1) return;
    if (fromIdx === toIndex) return;
    var item = this.data.items.splice(fromIdx, 1)[0];
    var adj = toIndex;
    if (fromIdx < toIndex) adj = toIndex - 1;
    adj = Math.max(0, Math.min(adj, this.data.items.length));
    this.data.items.splice(adj, 0, item);
    this.save();
  },

  deleteItem(id) {
    this.data.items = this.data.items.filter(i => i.id !== id);
    this.save();
  },

  loadSampleData(sampleData) {
    this.data = this._defaults();
    this.data.categories = JSON.parse(JSON.stringify(sampleData.categories));
    this.data.items = JSON.parse(JSON.stringify(sampleData.items));
    this.data.nextCategoryId = Math.max(...this.data.categories.map(c => parseInt(c.id.split('-')[1]) || 0), 0) + 1;
    this.data.nextItemId = Math.max(...this.data.items.map(i => parseInt(i.id.split('-')[1]) || 0), 0) + 1;
    this.save();
  },

  reset() {
    this.data = this._defaults();
    this.save();
  },

  getStats() {
    const items = this.data.items;
    const rarityCount = {};
    const categoryCount = {};

    items.forEach(item => {
      rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
      categoryCount[item.categoryId] = (categoryCount[item.categoryId] || 0) + 1;
    });

    let topCategory = null;
    let topCount = 0;
    Object.entries(categoryCount).forEach(([catId, count]) => {
      if (count > topCount) {
        topCount = count;
        topCategory = this.getCategory(catId);
      }
    });

    return {
      total: items.length,
      rarityCount,
      topCategory,
      topCount,
    };
  },
};
