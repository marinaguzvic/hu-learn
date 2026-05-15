/**
 * sidebar.js — builds the left navigation from manifest data
 */

let _navigate = null;

export function buildSidebar(manifest, navigateFn) {
  _navigate = navigateFn;
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';

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
        btn.classList.toggle('open');
        list.classList.toggle('open');
      }
      navigateFn(mod.id, null);
    });
    section.appendChild(btn);

    if (mod.categories?.length) {
      const list = document.createElement('div');
      list.className = 'nav-category-list';
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
  // module buttons
  document.querySelectorAll('.nav-module-btn').forEach(btn => {
    const modId = btn.closest('.nav-module')?.dataset.moduleId;
    btn.classList.toggle('active', modId === moduleId);

    // auto-open if this module is active
    if (modId === moduleId && categoryId) {
      btn.classList.add('open');
      const list = btn.nextElementSibling;
      if (list?.classList.contains('nav-category-list')) {
        list.classList.add('open');
      }
    }
  });

  // category buttons
  document.querySelectorAll('.nav-cat-btn').forEach(btn => {
    btn.classList.toggle(
      'active',
      btn.dataset.moduleId === moduleId && btn.dataset.categoryId === categoryId
    );
  });
}
