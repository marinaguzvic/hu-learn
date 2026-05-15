/**
 * app.js — entry point
 *
 * Boot sequence:
 *   1. fetch /data/manifest.json
 *   2. build sidebar from manifest
 *   3. route to correct module renderer based on URL hash
 *
 * Adding a new module type (e.g. nouns, exercises):
 *   - Add a renderer in js/renderers/
 *   - Register it in RENDERERS below
 *   - Add your JSON file to /data/ and list it in manifest.json
 *   That's it.
 */

import { buildSidebar, setActiveNav } from './sidebar.js';
import { renderVerbs }    from './renderers/verbs.js';
import { renderIrregular } from './renderers/irregular.js';
import { renderHome }      from './renderers/home.js';
import { globalSearch }    from './search.js';

// ── Renderer registry ────────────────────────────────────────────────────────
// key = module.type in manifest.json
const RENDERERS = {
  verbs:     renderVerbs,
  irregular: renderIrregular,
  // nouns:    renderNouns,     ← add when ready
  // adjectives: renderAdjectives,
  // exercises: renderExercises,
};

// ── State ────────────────────────────────────────────────────────────────────
let MANIFEST  = null;
let MODULE_CACHE = {};   // { "moduleId": { ...data } }

// ── Boot ─────────────────────────────────────────────────────────────────────
async function boot() {
  try {
    const res = await fetch('data/manifest.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    MANIFEST = await res.json();
  } catch (e) {
    showError('Could not load manifest.json — is the data volume mounted?', e);
    return;
  }

  document.getElementById('contentVersion').textContent =
    MANIFEST.version ? `v${MANIFEST.version}` : '';

  buildSidebar(MANIFEST, navigate);
  globalSearch(MANIFEST, loadModule, renderSearchResults);

  window.addEventListener('hashchange', routeHash);
  routeHash();
}

// ── Routing ───────────────────────────────────────────────────────────────────
function routeHash() {
  const hash = location.hash.slice(1);  // e.g. "verbs/objectactions"
  if (!hash) {
    navigate(null, null);
    return;
  }
  const [moduleId, categoryId] = hash.split('/');
  navigate(moduleId, categoryId || null);
}

export async function navigate(moduleId, categoryId) {
  // update URL without triggering hashchange loop
  const target = moduleId
    ? `#${moduleId}${categoryId ? '/' + categoryId : ''}`
    : '#';
  if (location.hash !== target) {
    history.replaceState(null, '', target || window.location.pathname);
  }

  setActiveNav(moduleId, categoryId);

  if (!moduleId) {
    renderHome(MANIFEST, navigate);
    setBreadcrumb([]);
    return;
  }

  const modMeta = MANIFEST.modules.find(m => m.id === moduleId);
  if (!modMeta) { showError(`Module "${moduleId}" not found in manifest.`); return; }

  // show module overview if no category selected
  if (!categoryId) {
    renderHome(MANIFEST, navigate, moduleId);
    setBreadcrumb([{ label: modMeta.label }]);
    return;
  }

  const data = await loadModule(moduleId);
  if (!data) return;

  const catMeta = modMeta.categories?.find(c => c.id === categoryId);
  const catLabel = catMeta?.label || categoryId;

  setBreadcrumb([
    { label: modMeta.label, action: () => navigate(moduleId, null) },
    { label: catLabel },
  ]);

  const renderer = RENDERERS[modMeta.type];
  if (!renderer) {
    showError(`No renderer registered for type "${modMeta.type}".`);
    return;
  }

  const content = document.getElementById('contentArea');
  content.innerHTML = '';
  renderer(data, categoryId, content, modMeta);
}

// ── Data loading ──────────────────────────────────────────────────────────────
export async function loadModule(moduleId) {
  if (MODULE_CACHE[moduleId]) return MODULE_CACHE[moduleId];

  const modMeta = MANIFEST.modules.find(m => m.id === moduleId);
  if (!modMeta) return null;

  setLoading(true);
  try {
    const res = await fetch(`data/${modMeta.file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} loading ${modMeta.file}`);
    const data = await res.json();
    MODULE_CACHE[moduleId] = data;
    return data;
  } catch (e) {
    showError(`Failed to load ${modMeta.file}`, e);
    return null;
  } finally {
    setLoading(false);
  }
}

// ── Search results renderer ───────────────────────────────────────────────────
function renderSearchResults(results, query) {
  setBreadcrumb([{ label: `Search: "${query}"` }]);
  const content = document.getElementById('contentArea');
  content.innerHTML = '';

  if (!results.length) {
    content.innerHTML = `<div class="empty-state"><h3>No results for "${query}"</h3><p>Try a different word or prefix.</p></div>`;
    return;
  }

  const header = document.createElement('div');
  header.className = 'search-results-header';
  header.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
  content.appendChild(header);

  results.forEach(hit => {
    const el = document.createElement('div');
    el.className = 'search-hit';
    el.innerHTML = `
      <div class="search-hit-path">${hit.path}</div>
      <span class="search-hit-hu">${highlight(hit.hu, query)}</span>
      <span class="search-hit-en">${highlight(hit.en, query)}</span>`;
    el.addEventListener('click', () => navigate(hit.moduleId, hit.categoryId));
    content.appendChild(el);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setBreadcrumb(parts) {
  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = '';
  parts.forEach((p, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'bc-sep';
      sep.textContent = '/';
      bc.appendChild(sep);
    }
    if (p.action) {
      const btn = document.createElement('button');
      btn.textContent = p.label;
      btn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--text2);font-size:13px;';
      btn.addEventListener('click', p.action);
      bc.appendChild(btn);
    } else {
      const span = document.createElement('span');
      span.className = i === parts.length - 1 ? 'bc-current' : '';
      span.textContent = p.label;
      bc.appendChild(span);
    }
  });
}

function setLoading(on) {
  const content = document.getElementById('contentArea');
  if (on) {
    content.innerHTML = `<div class="center-message"><div class="spinner"></div><p>Loading…</p></div>`;
  }
}

function showError(msg, err) {
  console.error(msg, err);
  const content = document.getElementById('contentArea');
  content.innerHTML = `<div class="empty-state"><h3>⚠ Error</h3><p>${msg}</p></div>`;
}

export function highlight(text, query) {
  if (!query || !text) return text || '';
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return String(text).replace(re, '<mark>$1</mark>');
}

// sidebar toggle for mobile
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('contentArea').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
});

boot();
