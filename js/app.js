(function () {
  'use strict';

  const RARITIES = {
    common:    { label: 'Común',       color: '#9d9d9d', icon: '⚪' },
    uncommon:  { label: 'Poco Común',  color: '#1eff00', icon: '🟢' },
    rare:      { label: 'Raro',        color: '#0070dd', icon: '🔵' },
    epic:      { label: 'Épico',       color: '#a335ee', icon: '🟣' },
    legendary: { label: 'Legendario',  color: '#ff8000', icon: '🟠' },
  };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  function $$(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  var App = {
    currentCategory: null,
    editingItemId: null,
    els: {},

    init: function () {
      Store.init();
      this.cacheDom();
      this.bindEvents();
      this.setupDragDrop();
      this.render();
    },

    cacheDom: function () {
      this.els = {
        categoryList: $('#category-list'),
        catAll: $('#cat-all'),
        viewTitle: $('#view-title'),
        grid: $('#grid'),
        emptyState: $('#empty-state'),
        searchInput: $('#search-input'),
        rarityFilter: $('#rarity-filter'),
        btnAddItem: $('#btn-add-item'),
        btnAddCategory: $('#btn-add-category'),
        btnLoadSample: $('#btn-load-sample'),
        btnReset: $('#btn-reset'),
        modalOverlay: $('#modal-overlay'),
        modalTitle: $('#modal-title'),
        modalClose: $('#modal-close'),
        modalCancel: $('#modal-cancel'),
        itemForm: $('#item-form'),
        fName: $('#f-name'),
        fCategory: $('#f-category'),
        fRarity: $('#f-rarity'),
        fQuantity: $('#f-quantity'),
        fDate: $('#f-date'),
        fDescription: $('#f-description'),
        fImage: $('#f-image'),
        fPrice: $('#f-price'),
        fCurrency: $('#f-currency'),
        fAcquiredFrom: $('#f-acquired-from'),
        catActions: $('#category-actions'),
        btnEditCategory: $('#btn-edit-category'),
        btnDeleteCategory: $('#btn-delete-category'),
        btnDatePicker: $('#btn-date-picker'),
        detailOverlay: $('#detail-overlay'),
        detailContent: $('#detail-content'),
        detailClose: $('#detail-close'),
        statsPanel: $('#stats-panel'),
        btnSettings: $('#btn-settings'),
        settingsPanel: $('#settings-panel'),
        btnExport: $('#btn-export'),
        btnEmptyAdd: $('#btn-empty-add'),
      };
    },

    bindEvents: function () {
      var self = this;

      this.els.catAll.addEventListener('click', function () {
        Sounds.click();
        self.currentCategory = null;
        self.updateCategoryNav();
        self.updateViewTitle();
        self.renderGrid();
      });

      this.els.searchInput.addEventListener('input', function () {
        self.renderGrid();
      });

      this.els.rarityFilter.addEventListener('change', function () {
        self.renderGrid();
      });

      this.els.btnAddItem.addEventListener('click', function () {
        Sounds.click();
        self.openModal();
      });

      this.els.btnAddCategory.addEventListener('click', function () {
        self.promptAddCategory();
      });

      this.els.btnSettings.addEventListener('click', function () {
        Sounds.click();
        self.els.settingsPanel.classList.toggle('hidden');
      });

      this.els.btnLoadSample.addEventListener('click', function () {
        self.loadSampleData();
        self.els.settingsPanel.classList.add('hidden');
      });

      this.els.btnReset.addEventListener('click', function () {
        self.resetData();
        self.els.settingsPanel.classList.add('hidden');
      });

      this.els.btnExport.addEventListener('click', function () {
        self.exportToExcel();
        self.els.settingsPanel.classList.add('hidden');
      });

      this.els.modalClose.addEventListener('click', function () { self.closeModal(); });
      this.els.modalCancel.addEventListener('click', function () { self.closeModal(); });
      this.els.modalOverlay.addEventListener('click', function (e) {
        if (e.target === self.els.modalOverlay) self.closeModal();
      });

      this.els.detailClose.addEventListener('click', function () { self.closeDetailView(); });
      this.els.detailOverlay.addEventListener('click', function (e) {
        if (e.target === self.els.detailOverlay) self.closeDetailView();
      });

      this.els.itemForm.addEventListener('submit', function (e) {
        e.preventDefault();
        self.handleFormSubmit();
      });

      this.els.btnDatePicker.addEventListener('click', function () {
        try { self.els.fDate.showPicker(); } catch {}
      });
      this.els.fDate.addEventListener('click', function () {
        try { this.showPicker(); } catch {}
      });

      this.els.btnEditCategory.addEventListener('click', function () {
        Sounds.click();
        self.promptEditCategory();
      });

      this.els.btnDeleteCategory.addEventListener('click', function () {
        Sounds.click();
        self.promptDeleteCategory();
      });

      this.els.btnEmptyAdd.addEventListener('click', function () {
        Sounds.click();
        self.openModal();
      });

      Store.onChange(function () {
        self.renderCategoryList();
        self.renderStats();
        self.updateViewTitle();
        self.renderGrid();
        self.checkEmptyState();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (!self.els.detailOverlay.classList.contains('hidden')) {
            self.closeDetailView();
          } else {
            self.closeModal();
          }
        }
      });
    },

    render: function () {
      this.renderCategoryList();
      this.renderGrid();
      this.renderStats();
      this.updateViewTitle();
      this.checkEmptyState();
    },

    renderCategoryList: function () {
      var cats = Store.getCategories();
      var self = this;
      var html = '';

      cats.forEach(function (c) {
        html +=
          '<button class="cat-item' +
          (self.currentCategory === c.id ? ' active' : '') +
          '" data-cat-id="' +
          c.id +
          '">' +
          '<span class="cat-icon">' +
          (c.icon || '📦') +
          '</span>' +
          '<span class="cat-name">' +
          escapeHtml(c.name) +
          '</span>' +
          '<span class="cat-count" data-count-for="' +
          c.id +
          '">0</span>' +
          '</button>';
      });

      this.els.categoryList.innerHTML = html;

      this.els.categoryList.querySelectorAll('.cat-item').forEach(function (el) {
        el.addEventListener('click', function () {
          Sounds.click();
          self.currentCategory = el.dataset.catId;
          self.updateCategoryNav();
          self.updateViewTitle();
          self.renderGrid();
        });
      });

      this.updateCategoryCounts();
      this.updateCategoryNav();
    },

    updateCategoryNav: function () {
      this.els.catAll.classList.toggle('active', this.currentCategory === null);
      this.els.categoryList.querySelectorAll('.cat-item').forEach(function (el) {
        el.classList.toggle('active', el.dataset.catId === App.currentCategory);
      });
    },

    updateCategoryCounts: function () {
      var items = Store.getItems();
      var cats = Store.getCategories();
      this.els.catAll.querySelector('.cat-count').textContent = items.length;
      cats.forEach(function (c) {
        var el = document.querySelector('.cat-count[data-count-for="' + c.id + '"]');
        if (el) {
          el.textContent = items.filter(function (i) { return i.categoryId === c.id; }).length;
        }
      });
    },

    updateViewTitle: function () {
      if (this.currentCategory) {
        var cat = Store.getCategory(this.currentCategory);
        this.els.viewTitle.textContent = (cat ? cat.icon : '📋') + ' ' + (cat ? cat.name : 'Categoría');
        this.els.catActions.classList.remove('hidden');
      } else {
        this.els.viewTitle.textContent = '📋 Todas las Categorías';
        this.els.catActions.classList.add('hidden');
      }
    },

    renderGrid: function () {
      var items = this.getFilteredItems();
      this.els.grid.innerHTML = '';

      if (items.length === 0) {
        this.els.emptyState.classList.remove('hidden');
        this.els.grid.classList.add('hidden');
        return;
      }

      this.els.emptyState.classList.add('hidden');
      this.els.grid.classList.remove('hidden');

      var self = this;
      var grid = this.els.grid;

      items.forEach(function (item) {
        var card = self.createItemCard(item);
        card.draggable = true;
        card.dataset.itemId = item.id;

        card.addEventListener('dragstart', function (e) {
          this.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', this.dataset.itemId);
        });

        card.addEventListener('dragend', function () {
          grid.querySelectorAll('.item-card').forEach(function (c) {
            c.classList.remove('dragging');
          });
          if (self._dropPlaceholder && self._dropPlaceholder.parentNode) {
            self._dropPlaceholder.parentNode.removeChild(self._dropPlaceholder);
          }
          self._dragInsertIdx = -1;
        });

        grid.appendChild(card);
      });
    },

    setupDragDrop: function () {
      var self = this;
      var grid = this.els.grid;

      var placeholder = document.createElement('div');
      placeholder.className = 'drop-placeholder';
      this._dropPlaceholder = placeholder;

      function getInsertIndex(clientX, clientY) {
        var cards = grid.querySelectorAll('.item-card');
        var n = cards.length;
        if (n === 0) return 0;
        var gridRect = grid.getBoundingClientRect();
        var colCount = 1;
        try { colCount = window.getComputedStyle(grid).gridTemplateColumns.split(' ').length; } catch (_) {}
        var fr = cards[0].getBoundingClientRect();
        var stepX = fr.width + 14;
        var stepY = fr.height + 14;
        var rx = clientX - gridRect.left;
        var ry = clientY - gridRect.top;
        var col = Math.floor(rx / stepX);
        var row = Math.floor(ry / stepY);
        col = Math.max(0, Math.min(col, colCount - 1));
        row = Math.max(0, row);
        var idx = row * colCount + col;
        idx = Math.min(idx, n);
        var cellLeft = col * stepX;
        var offsetX = rx - cellLeft;
        if (offsetX > fr.width * 0.55 && idx < n) idx++;
        return idx;
      }

      function placeAt(idx) {
        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        var cards = grid.querySelectorAll('.item-card');
        var n = cards.length;
        if (n === 0) return;
        if (idx <= 0) {
          grid.insertBefore(placeholder, cards[0]);
        } else if (idx >= n) {
          grid.appendChild(placeholder);
        } else {
          grid.insertBefore(placeholder, cards[idx]);
        }
      }

      function removePlaceholder() {
        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      }

      grid.addEventListener('dragenter', function (e) { e.preventDefault(); });

      grid.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        self._dragInsertIdx = getInsertIndex(e.clientX, e.clientY);
        placeAt(self._dragInsertIdx);
      });

      grid.addEventListener('dragleave', function (e) {
        if (!grid.contains(e.relatedTarget)) { removePlaceholder(); self._dragInsertIdx = -1; }
      });

      grid.addEventListener('drop', function (e) {
        e.preventDefault();
        removePlaceholder();
        var fromId = e.dataTransfer.getData('text/plain');
        var idx = self._dragInsertIdx;
        self._dragInsertIdx = -1;
        if (!fromId || idx < 0) return;
        var all = Store.getItems();
        idx = Math.min(idx, all.length);
        if (idx >= all.length) {
          Store.moveItemToIndex(fromId, all.length);
        } else {
          var target = all[idx];
          if (target && fromId !== target.id) Store.moveItem(fromId, target.id);
        }
        Sounds.click();
      });
    },

    createItemCard: function (item) {
      var cat = Store.getCategory(item.categoryId);
      var rarity = RARITIES[item.rarity] || RARITIES.common;
      var card = document.createElement('div');
      card.className = 'item-card rarity-' + item.rarity;
      card.style.setProperty('--rarity-color', rarity.color);

      var imageHtml = item.imageUrl
        ? '<div class="card-image"><img src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.name) + '" loading="lazy"></div>'
        : '<div class="card-image card-image-placeholder">' + (cat ? (cat.icon || '📦') : '📦') + '</div>';

      card.innerHTML =
        '<div class="card-rarity-bar"></div>' +
        imageHtml +
        '<div class="card-body">' +
        '<h3 class="card-name" style="color:' + rarity.color + '">' +
        escapeHtml(item.name) +
        '</h3>' +
        '<div class="card-rarity" style="color:' + rarity.color + '">' +
        rarity.icon + ' ' + rarity.label +
        '</div>' +
        '<div class="card-meta">' +
        '<span class="card-category">' +
        (cat ? (cat.icon || '📦') + ' ' + escapeHtml(cat.name) : '📦 Sin categoría') +
        '</span>' +
        '<span class="card-quantity">✕' + item.quantity + '</span>' +
        '</div>' +
        (item.price
          ? '<div class="card-price">💰 ' + (item.currency === 'USD' ? 'US$' : '$') + parseFloat(item.price).toFixed(2) + '</div>'
          : '') +
        (item.acquiredFrom
          ? '<div class="card-source">📍 ' + escapeHtml(item.acquiredFrom) + '</div>'
          : '') +
        (item.description
          ? '<p class="card-description">' + escapeHtml(item.description) + '</p>'
          : '') +
        '<div class="card-actions">' +
        '<button class="btn-icon btn-duplicate" data-id="' + item.id + '" title="Duplicar">📋</button>' +
        '<button class="btn-icon btn-edit" data-id="' + item.id + '" title="Editar">✏️</button>' +
        '<button class="btn-icon btn-delete" data-id="' + item.id + '" title="Eliminar">🗑️</button>' +
        '</div>' +
        '</div>';

      card.addEventListener('click', function () {
        Sounds.click();
        App.openDetailView(item.id);
      });

      card.querySelector('.btn-duplicate').addEventListener('click', function (e) {
        e.stopPropagation();
        Store.duplicateItem(this.dataset.id);
        Sounds.drop();
      });

      card.querySelector('.btn-edit').addEventListener('click', function (e) {
        e.stopPropagation();
        Sounds.click();
        App.closeDetailView();
        App.openModal(this.dataset.id);
      });

      card.querySelector('.btn-delete').addEventListener('click', function (e) {
        e.stopPropagation();
        App.closeDetailView();
        if (confirm('¿Eliminar "' + item.name + '"?')) {
          Store.deleteItem(this.dataset.id);
          Sounds.delete();
        }
      });

      return card;
    },

    renderStats: function () {
      var stats = Store.getStats();
      var rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      var html =
        '<div class="stats-panel">' +
        '<h4>📊 Estadísticas</h4>' +
        '<div class="stat-total">Total: <strong>' + stats.total + '</strong> items</div>' +
        '<div class="stat-rarity-bars">';

      rarityOrder.forEach(function (key) {
        var r = RARITIES[key];
        var count = stats.rarityCount[key] || 0;
        var pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
        html +=
          '<div class="stat-bar-row">' +
          '<span class="stat-bar-label">' + r.icon + '</span>' +
          '<div class="stat-bar-track"><div class="stat-bar-fill" style="width:' + pct + '%;background:' + r.color + '"></div></div>' +
          '<span class="stat-bar-value">' + count + '</span>' +
          '</div>';
      });

      html += '</div>';

      if (stats.topCategory) {
        html +=
          '<div class="stat-top-cat">🏆 Categoría top: <strong>' +
          (stats.topCategory.icon || '📦') + ' ' +
          escapeHtml(stats.topCategory.name) +
          '</strong> (' + stats.topCount + ')</div>';
      }

      html += '</div>';
      this.els.statsPanel.innerHTML = html;
    },

    showEmptyState: function () {
      this.els.emptyState.classList.remove('hidden');
      this.els.grid.classList.add('hidden');
    },

    checkEmptyState: function () {
      var items = this.getFilteredItems();
      if (items.length === 0 && Store.getItems().length === 0) {
        this.els.emptyState.classList.remove('hidden');
        this.els.grid.classList.add('hidden');
      } else if (items.length === 0) {
        this.els.emptyState.classList.remove('hidden');
        this.els.emptyState.querySelector('.empty-title').textContent = '😕 Sin resultados';
        this.els.emptyState.querySelector('.empty-desc').textContent = 'No hay items que coincidan con tu búsqueda.';
        this.els.grid.classList.add('hidden');
      } else {
        this.els.emptyState.classList.add('hidden');
        this.els.grid.classList.remove('hidden');
        this.els.emptyState.querySelector('.empty-title').textContent = '🎒 ¡El inventario está vacío!';
        this.els.emptyState.querySelector('.empty-desc').textContent = 'Añade tu primer item al inventario.';
      }
    },

    getFilteredItems: function () {
      var items = Store.getItems();
      var query = this.els.searchInput.value.toLowerCase().trim();
      var rarity = this.els.rarityFilter.value;

      if (this.currentCategory) {
        items = items.filter(function (i) { return i.categoryId === App.currentCategory; });
      }

      if (query) {
        items = items.filter(function (i) {
          return (
            i.name.toLowerCase().includes(query) ||
            i.description.toLowerCase().includes(query)
          );
        });
      }

      if (rarity) {
        items = items.filter(function (i) { return i.rarity === rarity; });
      }

      return items;
    },

    openModal: function (itemId) {
      this.editingItemId = itemId || null;

      var cats = Store.getCategories();
      var catOptions = cats
        .map(function (c) {
          return '<option value="' + c.id + '">' + (c.icon || '📦') + ' ' + escapeHtml(c.name) + '</option>';
        })
        .join('');
      this.els.fCategory.innerHTML = catOptions;

      if (itemId) {
        var item = Store.getItem(itemId);
        if (!item) return;
        this.els.modalTitle.textContent = '✏️ Editar Item';
        this.els.fName.value = item.name;
        this.els.fCategory.value = item.categoryId;
        this.els.fRarity.value = item.rarity;
        this.els.fQuantity.value = item.quantity;
        this.els.fDate.value = item.acquiredDate;
        this.els.fPrice.value = item.price || '';
        this.els.fCurrency.value = item.currency || 'CLP';
        this.els.fAcquiredFrom.value = item.acquiredFrom || '';
        this.els.fDescription.value = item.description;
        this.els.fImage.value = item.imageUrl || '';
      } else {
        this.els.modalTitle.textContent = '➕ Nuevo Item';
        this.els.itemForm.reset();
        this.els.fDate.value = new Date().toISOString().split('T')[0];
        this.els.fQuantity.value = 1;
        this.els.fPrice.value = '';
        this.els.fCurrency.value = 'CLP';
        if (cats.length > 0) {
          this.els.fCategory.value = cats[0].id;
        }
      }

      this.els.modalOverlay.classList.remove('hidden');
      var _this = this;
      setTimeout(function () { _this.els.fName.focus(); }, 100);
    },

    closeModal: function () {
      this.els.modalOverlay.classList.add('hidden');
      this.editingItemId = null;
    },

    openDetailView: function (itemId) {
      var item = Store.getItem(itemId);
      if (!item) return;
      var cat = Store.getCategory(item.categoryId);
      var rarity = RARITIES[item.rarity] || RARITIES.common;
      var self = this;

      var html =
        '<div class="detail-rarity-bar" style="background:' + rarity.color + '"></div>' +
        '<div class="detail-top">' +
        '<div class="detail-icon">' + (cat ? (cat.icon || '📦') : '📦') + '</div>' +
        '<div class="detail-name" style="color:' + rarity.color + '">' + escapeHtml(item.name) + '</div>' +
        '<div class="detail-rarity-label" style="color:' + rarity.color + '">' + rarity.icon + ' ' + rarity.label + '</div>' +
        '</div>' +
        '<div class="detail-body">' +
        '<div class="detail-row"><span class="detail-row-label">Categoría</span><span class="detail-row-value">' + (cat ? escapeHtml(cat.name) : '—') + '</span></div>' +
        '<div class="detail-row"><span class="detail-row-label">Cantidad</span><span class="detail-row-value">✕ ' + item.quantity + '</span></div>' +
        (item.price
          ? '<div class="detail-row"><span class="detail-row-label">Precio</span><span class="detail-row-value">' + (item.currency === 'USD' ? 'US$' : '$') + parseFloat(item.price).toFixed(2) + '</span></div>'
          : '') +
        (item.acquiredFrom
          ? '<div class="detail-row"><span class="detail-row-label">Adquirido en</span><span class="detail-row-value">' + escapeHtml(item.acquiredFrom) + '</span></div>'
          : '') +
        (item.acquiredDate
          ? '<div class="detail-row"><span class="detail-row-label">Fecha</span><span class="detail-row-value">' + escapeHtml(item.acquiredDate) + '</span></div>'
          : '') +
        (item.imageUrl
          ? '<div class="detail-row"><span class="detail-row-label">Imagen</span><span class="detail-row-value"><a href="' + escapeHtml(item.imageUrl) + '" target="_blank" style="color:var(--accent)">Ver imagen</a></span></div>'
          : '') +
        (item.description
          ? '<div class="detail-description">' + escapeHtml(item.description) + '</div>'
          : '') +
        '<div class="detail-actions">' +
        '<button class="btn-secondary" id="detail-dup-btn">📋 Duplicar</button>' +
        '<button class="btn-secondary" id="detail-edit-btn">✏️ Editar</button>' +
        '<button class="btn-primary" id="detail-delete-btn">🗑️ Eliminar</button>' +
        '</div>' +
        '</div>';

      this.els.detailContent.innerHTML = html;
      this.els.detailOverlay.classList.remove('hidden');

      setTimeout(function () {
        var dupBtn = document.getElementById('detail-dup-btn');
        var editBtn = document.getElementById('detail-edit-btn');
        var deleteBtn = document.getElementById('detail-delete-btn');
        if (dupBtn) {
          dupBtn.addEventListener('click', function () {
            Store.duplicateItem(itemId);
            self.closeDetailView();
            Sounds.drop();
          });
        }
        if (editBtn) {
          editBtn.addEventListener('click', function () {
            Sounds.click();
            self.closeDetailView();
            self.openModal(itemId);
          });
        }
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function () {
            if (confirm('¿Eliminar "' + item.name + '"?')) {
              self.closeDetailView();
              Store.deleteItem(itemId);
              Sounds.delete();
            }
          });
        }
      }, 50);
    },

    closeDetailView: function () {
      this.els.detailOverlay.classList.add('hidden');
    },

    handleFormSubmit: function () {
      var data = {
        name: this.els.fName.value.trim(),
        categoryId: this.els.fCategory.value,
        rarity: this.els.fRarity.value,
        quantity: parseInt(this.els.fQuantity.value) || 1,
        price: this.els.fPrice.value.trim(),
        currency: this.els.fCurrency.value,
        acquiredFrom: this.els.fAcquiredFrom.value.trim(),
        acquiredDate: this.els.fDate.value,
        description: this.els.fDescription.value.trim(),
        imageUrl: this.els.fImage.value.trim(),
      };

      if (!data.name) return;

      if (this.editingItemId) {
        Store.updateItem(this.editingItemId, data);
        Sounds.click();
      } else {
        Store.addItem(data);
        Sounds.drop();
      }

      this.closeModal();
    },

    promptAddCategory: function () {
      var name = prompt('Nombre de la nueva categoría:');
      if (name && name.trim()) {
        var icon = prompt('Ícono (emoji) para la categoría (opcional, presiona Enter para omitir):', '📦');
        Store.addCategory(name.trim(), icon || '📦');
        Sounds.click();
      }
    },

    promptEditCategory: function () {
      if (!this.currentCategory) return;
      var cat = Store.getCategory(this.currentCategory);
      if (!cat) return;
      var name = prompt('Nombre de la categoría:', cat.name);
      if (name && name.trim()) {
        var icon = prompt('Ícono (emoji):', cat.icon || '📦');
        Store.updateCategory(this.currentCategory, name.trim(), icon || cat.icon);
        this.updateViewTitle();
        Sounds.click();
      }
    },

    promptDeleteCategory: function () {
      if (!this.currentCategory) return;
      var cat = Store.getCategory(this.currentCategory);
      if (!cat) return;
      if (confirm('¿Eliminar categoría "' + cat.name + '"? También se eliminarán todos sus items (' + Store.getItems().filter(function (i) { return i.categoryId === App.currentCategory; }).length + ' items).')) {
        Store.deleteCategory(this.currentCategory);
        this.currentCategory = null;
        this.updateCategoryNav();
        this.updateViewTitle();
        this.renderGrid();
        this.renderStats();
        this.checkEmptyState();
        Sounds.delete();
      }
    },

    loadSampleData: function () {
      if (Store.getItems().length > 0) {
        if (!confirm('¿Cargar datos de ejemplo? Esto reemplazará todos los datos actuales.')) return;
      }
      Store.loadSampleData(SAMPLE_DATA);
      this.currentCategory = null;
      this.els.searchInput.value = '';
      this.els.rarityFilter.value = '';
      this.updateCategoryNav();
      this.updateViewTitle();
      this.renderGrid();
      this.renderStats();
      this.checkEmptyState();
      Sounds.drop();
    },

    resetData: function () {
      if (!confirm('¿Resetear inventario? Se borrarán todos los datos. Esta acción no se puede deshacer.')) return;
      Store.reset();
      this.currentCategory = null;
      this.els.searchInput.value = '';
      this.els.rarityFilter.value = '';
      this.updateCategoryNav();
      this.updateViewTitle();
      this.renderGrid();
      this.renderStats();
      this.checkEmptyState();
      Sounds.delete();
    },

    exportToExcel: function () {
      var items = Store.getItems();
      if (items.length === 0) {
        alert('No hay items para exportar. Añade algunos items primero.');
        return;
      }

      var cats = Store.getCategories();
      var catMap = {};
      cats.forEach(function (c) { catMap[c.id] = c; });

      var rarityLabels = { common: 'Común', uncommon: 'Poco Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario' };

      function csvEscape(str) {
        str = String(str || '');
        if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }

      var rows = [];
      var headers = ['Nombre','Categoría','Rareza','Cantidad','Precio','Moneda','Adquirido en','Fecha','Descripción'];
      rows.push(headers.join(','));

      items.forEach(function (item) {
        var cat = catMap[item.categoryId];
        var price = item.price ? parseFloat(item.price).toFixed(2) : '';
        var currency = item.currency || 'CLP';
        var row = [
          item.name,
          cat ? cat.name : '',
          rarityLabels[item.rarity] || item.rarity,
          item.quantity,
          price,
          currency,
          item.acquiredFrom || '',
          item.acquiredDate || '',
          item.description || ''
        ];
        rows.push(row.map(csvEscape).join(','));
      });

      var csv = '\uFEFF' + rows.join('\r\n');
      var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      var blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'MyItemVault_' + new Date().toISOString().split('T')[0] + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Sounds.click();
    },
  };

  document.addEventListener('DOMContentLoaded', function () { App.init(); });
})();
