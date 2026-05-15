/**
 * renderers/irregular.js
 *
 * Renders the irregular verb module.
 * Expected JSON shape:  data/irregular.json → { verbs: IrrVerb[] }
 *
 * IrrVerb: {
 *   inf:      string          — "lenni"
 *   base:     string          — "van / lesz / volt"
 *   sub:      string          — subtitle
 *   pattern:  string          — HTML explanation
 *   forms:    ConjTable[]     — conjugation grids
 *   keyforms: {l,f}[]         — key form pills
 *   prefixes: Member[]        — prefixed variants (same shape as verbs.json Member)
 *   examples: {tag,hu,en}[]   — labelled example sentences
 * }
 *
 * ConjTable: { label: string, rows: [person, form][] }
 */

import { prefixClass, tenseTagStyle } from '../utils.js';

export function renderIrregular(data, categoryId, container, modMeta) {
  // This module has no sub-categories — categoryId is ignored,
  // but kept for API compatibility.

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `<h1 class="page-title">⚠ Irregular Verbs</h1>
    <p class="page-desc">Verbs with unpredictable stem changes, suppletive tenses, or incomplete paradigms. Master these first — they appear in almost every sentence.</p>`;
  container.appendChild(header);

  const note = document.createElement('div');
  note.className = 'note-box';
  note.innerHTML = `Two main irregular patterns: <b>sz-v alternation</b> (eszik, iszik, tesz, vesz, visz, hisz) — the stem changes dramatically in past tense. <b>Suppletive verbs</b> (van/lesz/volt, megy/ment) use entirely different roots across tenses. <b>Defective verbs</b> (kell, lehet, szabad) exist only in 3rd person singular.`;
  container.appendChild(note);

  const tplCard = document.getElementById('tpl-irr-card');

  (data.verbs || []).forEach(v => {
    const card = tplCard.content.cloneNode(true).querySelector('.card');
    card.querySelector('.irr-base').textContent = v.base;
    card.querySelector('.irr-sub').textContent  = v.sub;

    const body = card.querySelector('.card-body');

    // Pattern note
    body.querySelector('.irr-pattern').innerHTML = v.pattern;

    // Conjugation tables
    const grid = body.querySelector('.conj-grid');
    (v.forms || []).forEach(table => {
      const block = document.createElement('div');
      block.className = 'conj-block';
      block.innerHTML = `<div class="conj-label">${table.label}</div>` +
        (table.rows || []).map(([pro, form]) =>
          `<div class="conj-row"><span class="conj-pro">${pro}</span><span class="conj-form">${form}</span></div>`
        ).join('');
      grid.appendChild(block);
    });

    // Key forms
    const kfRow = body.querySelector('.key-forms-row');
    (v.keyforms || []).forEach(kf => {
      const pill = document.createElement('div');
      pill.className = 'key-pill';
      pill.innerHTML = `${kf.l}: <b>${kf.f}</b>`;
      kfRow.appendChild(pill);
    });

    // Prefixed forms
    const prefixWrap = body.querySelector('.irr-prefixes');
    if (v.prefixes?.length) {
      const label = document.createElement('div');
      label.className = 'irr-section-label';
      label.textContent = 'Prefixed forms';
      prefixWrap.appendChild(label);

      const table = document.createElement('table');
      table.className = 'verb-table';
      const tbody = document.createElement('tbody');

      v.prefixes.forEach(pv => {
        const tr = document.createElement('tr');
        tr.className = 'verb-row';

        const exHtml = (pv.ex || []).map(([hu, en]) =>
          `<div class="example-item"><span class="example-hu">${hu}</span> — ${en}</div>`
        ).join('');

        tr.innerHTML = `
          <td class="td-prefix"><span class="prefix-badge ${prefixClass(pv.p)}">${pv.p}</span></td>
          <td class="td-hu">${pv.hu}</td>
          <td class="td-en">${pv.en}</td>
          <td class="td-examples"><div class="example-list">${exHtml}</div></td>`;
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      prefixWrap.appendChild(table);
    }

    // Examples
    const exWrap = body.querySelector('.irr-examples-block');
    if (v.examples?.length) {
      const label = document.createElement('div');
      label.className = 'irr-section-label';
      label.textContent = 'In use';
      exWrap.before(label);

      v.examples.forEach(ex => {
        const row = document.createElement('div');
        row.className = 'irr-example-row';
        const { bg, color } = tenseTagStyle(ex.tag);
        row.innerHTML = `
          <span class="tense-tag" style="background:${bg};color:${color}">${ex.tag}</span>
          <span class="irr-example-hu">${ex.hu}</span>
          <span class="irr-example-en">— ${ex.en}</span>`;
        exWrap.appendChild(row);
      });
    }

    // Toggle
    card.querySelector('.card-header').addEventListener('click', () => {
      card.classList.toggle('collapsed');
    });

    container.appendChild(card);
  });
}
