/**
 * utils.js — shared helpers used by all renderers
 */

// ── Prefix → CSS class ────────────────────────────────────────────────────────
const PREFIX_MAP = {
  '—':       'pb--',
  'meg-':    'pb-meg-',
  'el-':     'pb-el-',
  'ki-':     'pb-ki-',
  'be-':     'pb-be-',
  'le-':     'pb-le-',
  'fel-':    'pb-fel-',
  'vissza-': 'pb-vissza-',
  'át-':     'pb-at-',
  'össze-':  'pb-ossze-',
};

export function prefixClass(prefix) {
  return PREFIX_MAP[prefix] || 'pb-other';
}

// ── Tense tag colours ─────────────────────────────────────────────────────────
const TAG_STYLES = {
  present:     { bg: 'var(--tag-present)',     color: 'var(--tagt-present)'     },
  past:        { bg: 'var(--tag-past)',         color: 'var(--tagt-past)'        },
  imperative:  { bg: 'var(--tag-imperative)',   color: 'var(--tagt-imperative)'  },
  modal:       { bg: 'var(--tag-modal)',        color: 'var(--tagt-modal)'       },
  conditional: { bg: 'var(--tag-conditional)',  color: 'var(--tagt-conditional)' },
  negative:    { bg: 'var(--tag-negative)',     color: 'var(--tagt-negative)'    },
  future:      { bg: 'var(--tag-future)',       color: 'var(--tagt-future)'      },
  factual:     { bg: 'var(--tag-factual)',      color: 'var(--tagt-factual)'     },
  kell:        { bg: 'var(--tag-kell)',         color: 'var(--tagt-kell)'        },
  lehet:       { bg: 'var(--tag-lehet)',        color: 'var(--tagt-lehet)'       },
  szabad:      { bg: 'var(--tag-szabad)',       color: 'var(--tagt-szabad)'      },
};

export function tenseTagStyle(tag) {
  return TAG_STYLES[tag] || { bg: 'var(--tag-factual)', color: 'var(--tagt-factual)' };
}
