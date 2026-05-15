/**
 * search.js — global search across all loaded module data
 */

import { loadModule } from './app.js';

let _manifest = null;
let _loadModule = null;
let _renderResults = null;
let _debounceTimer = null;

export function globalSearch(manifest, loadModuleFn, renderResultsFn) {
  _manifest    = manifest;
  _loadModule  = loadModuleFn;
  _renderResults = renderResultsFn;

  const input = document.getElementById('globalSearch');
  input.addEventListener('input', () => {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => runSearch(input.value.trim()), 220);
  });
}

async function runSearch(query) {
  if (query.length < 2) return;

  // Eagerly load all modules so search is comprehensive
  await Promise.all(
    _manifest.modules.map(m => _loadModule(m.id))
  );

  const q   = query.toLowerCase();
  const hits = [];

  _manifest.modules.forEach(mod => {
    const data = window.__moduleCache?.[mod.id];  // accessed via cache
    if (!data) return;

    if (mod.type === 'verbs' && data.categories) {
      Object.entries(data.categories).forEach(([catId, cat]) => {
        const catMeta = mod.categories?.find(c => c.id === catId);
        (cat.families || []).forEach(fam => {
          (fam.members || []).forEach(member => {
            if (
              member.hu?.toLowerCase().includes(q) ||
              member.en?.toLowerCase().includes(q) ||
              member.p?.toLowerCase().includes(q) ||
              (member.ex || []).some(([hu, en]) =>
                hu.toLowerCase().includes(q) || en.toLowerCase().includes(q)
              )
            ) {
              hits.push({
                moduleId:   mod.id,
                categoryId: catId,
                path:       `${mod.label} › ${catMeta?.label || catId} › ${fam.base}`,
                hu:         member.hu,
                en:         member.en,
              });
            }
          });
        });
      });
    }

    if (mod.type === 'irregular' && data.verbs) {
      data.verbs.forEach(v => {
        const matches =
          v.base?.toLowerCase().includes(q) ||
          v.inf?.toLowerCase().includes(q)  ||
          (v.prefixes || []).some(p =>
            p.hu?.toLowerCase().includes(q) || p.en?.toLowerCase().includes(q)
          ) ||
          (v.examples || []).some(e =>
            e.hu?.toLowerCase().includes(q) || e.en?.toLowerCase().includes(q)
          );

        if (matches) {
          hits.push({
            moduleId:   mod.id,
            categoryId: 'irregular',
            path:       `${mod.label} › ${v.inf}`,
            hu:         v.base,
            en:         v.sub,
          });
        }
      });
    }

    // Future module types: add their search logic here
  });

  _renderResults(hits.slice(0, 80), query);
}
