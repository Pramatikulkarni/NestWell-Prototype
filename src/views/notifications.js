import { icon } from '../icons.js';
import { set, get } from '../store.js';
import { esc, pageHead, offlineBanner } from './common.js';

export function notifications(st) {
  const f = st.nFilter || 'All';
  const list = st.notifications.filter(n => f === 'All' || n.cat === f);
  const unread = st.notifications.filter(n => n.unread).length;
  return `<main class="page" id="main-content">
    ${pageHead('Notifications', unread ? unread + ' unread' : 'You’re all caught up', `<button class="link" data-act="read-all">Mark all as read</button>`, '/patient/home')}
    ${offlineBanner(st)}
    <div class="tabs" role="tablist" aria-label="Filter">${['All', 'Alerts', 'Updates'].map(k => `<button role="tab" aria-selected="${k === f}" data-act="nfilter" data-v="${k}">${k}</button>`).join('')}</div>
    <div class="list" style="max-width:820px">${list.length ? list.map(n => `<button class="item card hover ${n.unread ? 'unread' : ''}" data-act="n-open" data-id="${n.id}" style="box-shadow:none">
      <span class="ibox ${n.tone}">${icon(n.icon)}</span><span class="grow"><span class="row sb"><span class="t">${esc(n.title)}</span><span class="cap">${esc(n.ago)}</span></span>
      <span class="s">${esc(n.body)}</span><br>${n.icon === 'wifiOff' ? '<span class="chip bad" style="margin-top:6px">Device issue</span>' : n.cat === 'Alerts' ? '<span class="chip warn" style="margin-top:6px">Reading review</span>' : ''}${n.unread ? '<span class="sr-only"> Unread</span>' : ''}</span></button>`).join('') : `<p class="muted">Nothing here.</p>`}</div></main>`;
}

export function notifSheet(st) {
  const n = st.notifications.find(x => x.id === st.nOpen); if (!n) return '';
  const clinical = n.cat === 'Alerts' && n.icon !== 'wifiOff';
  return `<div class="scrim" data-act="n-close-scrim"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="nh"><div class="row sb"><h2 class="h2" id="nh">${esc(n.title)}</h2><button class="btn ghost sm" data-act="n-close" aria-label="Close">${icon('close', 'sm')}</button></div>
    <p>${esc(n.body)}</p>
    ${clinical ? `<div class="banner warn">${icon('info', 'sm')}<span><strong>What to do next:</strong> follow your care plan and keep monitoring. If you feel unwell, contact your care team. In an emergency, call your local emergency number. This is not a diagnosis.</span></div><button class="btn primary block" data-act="n-contact">Contact care team</button>`
      : n.icon === 'wifiOff' ? `<div class="banner info">${icon('info', 'sm')}<span>This is a device problem, not a change in your health.</span></div><button class="btn primary block" data-act="n-fix">Fix device connection</button>` : ''}
    <button class="btn ghost block" data-act="n-close">Close</button></div></div>`;
}

export const acts = {
  nfilter: el => set({ nFilter: el.dataset.v }),
  'read-all': () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, unread: false })) })),
  'n-open': el => set(s => ({ nOpen: el.dataset.id, notifications: s.notifications.map(n => n.id === el.dataset.id ? { ...n, unread: false } : n) })),
  'n-close': () => set({ nOpen: null }),
  'n-close-scrim': (el, ev) => { if (ev.target === el) set({ nOpen: null }); },
  'n-contact': () => { set({ nOpen: null }); location.hash = '#patient-messages'; },
  'n-fix': () => { set({ nOpen: null }); location.hash = '#patient-devices'; },
};
