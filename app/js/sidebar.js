/**
 * sidebar.js — builds the left navigation from manifest data
 */

let _navigate = null;

export function buildSidebar(manifest, navigateFn) {
  _navigate = navigateFn;
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';

  // Home button at the top of the nav
  const homeBtn = document.createElement('button');
  homeBtn.className = 'nav-home-btn';
  homeBtn.dataset.navHome = 'true';
  homeBtn.innerHTML = `<span class="nav-module-icon">🏠</span><span>Home</span>`;
  homeBtn.addEventListener('click', () => navigateFn(null, null));
  nav.appendChild(homeBtn);

  manifest.modules.forEach(mod => {
    const section = document.createElement('div');
    section.className = 'nav-module';
    section.dataset.moduleId = mod.id;

    const btn = document.createElement('button');
    btn.className = 'nav-module-btn';
    btn.innerHTML = `
      <span class="nav-module-icon">${mod.icon || '📂'}</span>
      <span>${mod.label}</span>
      ${mod.categories?.length ? `<svg class="nav-module-chevron" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>` : ''}`;
    btn.addEventListener('click', () => {
      if (mod.categories?.length) {
        // Only collapse if clicking an already-active module; always expand otherwise
        const isActive = btn.classList.contains('active');
        const isOpen   = list.classList.contains('open');
        if (isActive && isOpen) {
          btn.classList.remove('open');
          list.classList.remove('open');
        } else {
          btn.classList.add('open');
          list.classList.add('open');
        }
      }
      navigateFn(mod.id, null);
    });
    section.appendChild(btn);

    if (mod.categories?.length) {
      const list = document.createElement('div');
      list.className = 'nav-category-list open'; // start expanded
      mod.categories.forEach(cat => {
        const catBtn = document.createElement('button');
        catBtn.className = 'nav-cat-btn';
        catBtn.dataset.moduleId = mod.id;
        catBtn.dataset.categoryId = cat.id;
        catBtn.textContent = cat.label;
        catBtn.addEventListener('click', e => {
          e.stopPropagation();
          navigateFn(mod.id, cat.id);
        });
        list.appendChild(catBtn);
      });
      section.appendChild(list);
    }

    nav.appendChild(section);
  });
}

export function setActiveNav(moduleId, categoryId) {
  // home button
  const homeBtn = document.querySelector('[data-nav-home]');
  if (homeBtn) homeBtn.classList.toggle('active', !moduleId);

  // module buttons
  document.querySelectorAll('.nav-module-btn').forEach(btn => {
    const modId = btn.closest('.nav-module')?.dataset.moduleId;
    btn.classList.toggle('active', modId === moduleId);
  });

  // category buttons
  document.querySelectorAll('.nav-cat-btn').forEach(btn => {
    btn.classList.toggle(
      'active',
      btn.dataset.moduleId === moduleId && btn.dataset.categoryId === categoryId
    );
  });
}
