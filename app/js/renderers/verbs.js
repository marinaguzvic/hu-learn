/**
 * renderers/verbs.js
 *
 * Renders a verb module category.
 * Expected JSON shape:  data/verbs.json → { categories: { [id]: Category } }
 *
 * Category: {
 *   label: string
 *   note?: string          — HTML shown in the blue note box
 *   families: Family[]
 * }
 *
 * Family: {
 *   base: string           — "megy — to go"
 *   sub:  string           — short subtitle
 *   members: Member[]
 * }
 *
 * Member: {
 *   p:  string             — prefix, e.g. "meg-" or "—"
 *   hu: string             — Hungarian form
 *   en: string             — English meaning
 *   ex: [string, string][] — [ [hu sentence, en translation], … ]
 * }
 */

import { prefixClass } from '../utils.js';

export function renderVerbs(data, categoryId, container, modMeta) {
  const cat = data.categories[categoryId];
  if (!cat) {
    container.innerHTML = `<div class="empty-state"><h3>Category not found</h3><p>"${categoryId}" doesn't exist in this data file.</p></div>`;
    return;
  }

  // Page header
  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `<h1 class="page-title">${cat.label}</h1>`;
  container.appendChild(header);

  // Note box
  if (cat.note) {
    const note = document.createElement('div');
    note.className = 'note-box';
    note.innerHTML = cat.note;
    container.appendChild(note);
  }

  // Families
  const tplCard = document.getElementById('tpl-verb-family');
  const tplRow  = document.getElementById('tpl-verb-row');

  (cat.families || []).forEach(fam => {
    const card = tplCard.content.cloneNode(true).querySelector('.card');
    card.querySelector('.card-title').textContent = fam.base;
    card.querySelector('.card-sub').textContent   = fam.sub || '';

    const tbody = card.querySelector('tbody');
    (fam.members || []).forEach(member => {
      const row = tplRow.content.cloneNode(true).querySelector('.verb-row');

      const badge = row.querySelector('.prefix-badge');
      badge.textContent  = member.p;
      badge.className    = `prefix-badge ${prefixClass(member.p)}`;

      row.querySelector('.td-hu').textContent = member.hu;
      row.querySelector('.td-en').textContent = member.en;

      const exList = row.querySelector('.example-list');
      (member.ex || []).forEach(([hu, en]) => {
        const item = document.createElement('div');
        item.className = 'example-item';
        item.innerHTML = `<span class="example-hu">${hu}</span> — ${en}`;
        exList.appendChild(item);
      });

      tbody.appendChild(row);
    });

    // collapse toggle
    card.querySelector('.card-header').addEventListener('click', () => {
      card.classList.toggle('collapsed');
    });

    container.appendChild(card);
  });
}
