import { icon } from '../icons.js';
import { resources } from '../data.js';
import { set } from '../store.js';
import { esc, pageHead, backBtn } from './common.js';

const iconFor = t => t === 'Video' ? 'video' : t === 'Guide' ? 'plan' : 'book';

export function resourcesView(st) {
  if (st.article) {
    const a = resources.find(r => r.id === st.article);
    return `<main class="page" id="main-content" style="max-width:760px;margin:0 auto;width:100%"><div class="hasback"><button class="back iconback" data-act="article" data-id="" aria-label="Back to health resources">${icon('chevL')}</button><h1 class="h1" id="page-title" tabindex="-1">${esc(a.title)}</h1><p class="tiny">${esc(a.cat)} · ${esc(a.type)} · ${a.mins} min</p></div>
      <div class="thumb" style="width:100%;height:150px;background:linear-gradient(135deg,${a.hue},#0c201f)" aria-hidden="true">${icon(iconFor(a.type), 'lg')}</div>
            ${a.body.map(p => `<p style="font-size:17px">${esc(p)}</p>`).join('')}
      <div class="banner info">${icon('info', 'sm')}<span>General information, not medical advice. Follow the guidance from your care team.</span></div></main>`;
  }
  const cats = ['All', ...new Set(resources.map(r => r.cat))];
  const f = st.rCat || 'All', q = (st.rQ || '').toLowerCase();
  const list = resources.filter(r => (f === 'All' || r.cat === f) && (!q || r.title.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q)));
  return `<main class="page" id="main-content">${pageHead('Health resources', 'Explore articles, videos and guides for a healthier you.', '', '/patient/home')}
    <div class="field" style="max-width:520px"><label class="sr-only" for="rs">Search resources</label><div style="position:relative"><span style="position:absolute;left:16px;top:15px;color:var(--text-3);z-index:2;pointer-events:none">${icon('search', 'sm')}</span><input id="rs" class="input" style="padding-left:44px" placeholder="Search topics, articles…" value="${esc(st.rQ || '')}" data-input="rq"></div></div>
    <div class="tabs" role="tablist" aria-label="Category">${cats.map(c => `<button role="tab" aria-selected="${c === f}" data-act="rcat" data-v="${c}">${c}</button>`).join('')}</div>
    <div class="grid g-d3 res-grid" role="list">${list.length ? list.map(r => `<button class="card hover row" role="listitem" data-act="article" data-id="${r.id}" style="text-align:left;align-items:center"><span class="thumb" style="background:linear-gradient(135deg,${r.hue},#0c201f)" aria-hidden="true">${icon(iconFor(r.type))}</span><span class="grow"><span class="t" style="font-weight:600;display:block">${esc(r.title)}</span><span class="cap">${esc(r.type)} · ${r.mins} min</span></span></button>`).join('') : '<p class="muted">No matches. Try a different word.</p>'}</div></main>`;
}
export const acts = {
  rcat: el => set({ rCat: el.dataset.v }),
  article: el => set({ article: el.dataset.id || null }),
};
export const inputs = { rq: el => { set({ rQ: el.value }); const i = document.getElementById('rs'); if (i) { i.focus(); i.setSelectionRange(el.value.length, el.value.length); } } };
