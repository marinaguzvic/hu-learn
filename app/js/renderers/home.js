/**
 * renderers/home.js
 * Renders the top-level home page or a module overview page.
 */

export function renderHome(manifest, navigate, moduleId = null) {
  const content = document.getElementById('contentArea');
  content.innerHTML = '';

  if (moduleId) {
    // Module overview — show category tiles
    const mod = manifest.modules.find(m => m.id === moduleId);
    if (!mod) return;

    const wrap = document.createElement('div');
    wrap.className = 'module-home';
    wrap.innerHTML = `
      <h1 class="module-home-title">${mod.icon || ''} ${mod.label}</h1>
      <p class="module-home-desc">${mod.description || ''}</p>
      <div class="category-grid" id="catGrid"></div>`;
    content.appendChild(wrap);

    const grid = wrap.querySelector('#catGrid');
    (mod.categories || []).forEach(cat => {
      const tile = document.createElement('div');
      tile.className = 'category-tile';
      tile.innerHTML = `
        <div class="category-tile-icon">${cat.icon || '📄'}</div>
        <div class="category-tile-name">${cat.label}</div>
        <div class="category-tile-desc">${cat.description || ''}</div>
        ${cat.count != null ? `<div class="category-tile-count">${cat.count} entries</div>` : ''}`;
      tile.addEventListener('click', () => navigate(moduleId, cat.id));
      grid.appendChild(tile);
    });

  } else {
    // Global home
    const wrap = document.createElement('div');
    wrap.className = 'module-home';
    wrap.innerHTML = `
      <h1 class="module-home-title">🇭🇺 Magyar Language Reference</h1>
      <p class="module-home-desc">${manifest.description || 'Select a module from the sidebar to get started.'}</p>
      <div class="category-grid" id="modGrid"></div>`;
    content.appendChild(wrap);

    const grid = wrap.querySelector('#modGrid');
    manifest.modules.forEach(mod => {
      const tile = document.createElement('div');
      tile.className = 'category-tile';
      tile.innerHTML = `
        <div class="category-tile-icon">${mod.icon || '📂'}</div>
        <div class="category-tile-name">${mod.label}</div>
        <div class="category-tile-desc">${mod.description || ''}</div>
        <div class="category-tile-count">${(mod.categories || []).length} categor${(mod.categories || []).length === 1 ? 'y' : 'ies'}</div>`;
      tile.addEventListener('click', () => navigate(mod.id, null));
      grid.appendChild(tile);
    });
  }
}
