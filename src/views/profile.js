import { icon } from '../icons.js';
import { user } from '../data.js';
import { set, get, reset } from '../store.js';
import { providers } from '../data.js';
import { esc, pageHead, avatar } from './common.js';

const row = (l, v) => `<div class="field"><label>${l}</label><div class="input" style="display:flex;align-items:center;background:var(--surface-2)">${esc(v)}</div></div>`;

export function profile(st) {
  const tab = st.pTab || 'Personal details';
  const body = tab === 'Personal details'
    ? `<div class="grid g2 g-d2">${row('Full name', user.name)}${row('Date of birth', user.dob)}${row('Gender', user.gender)}${row('Phone', user.phone)}${row('Email', user.email)}${row('Location', user.location)}</div>`
    : tab === 'Health info' ? `<div class="grid g2 g-d2">${row('Care provider', (() => { const c = providers.find(p => p.id === st.provider); return c ? c.name + ', ' + c.area : 'Not selected'; })())}${row('Programme', 'Cardiac health monitoring')}${row('Clinician', 'Dr. Ananya Rao')}${row('Enrolled', '10 Jan 2026')}${row('Devices assigned', '4')}</div><p class="cap">Clinical details are managed by your care team.</p>`
      : `<div class="grid g2 g-d2">${row('Emergency contact', user.emergency)}${row('Relationship', 'Spouse')}</div><p class="cap">Used only if your care team cannot reach you.</p>`;
  return `<main class="page" id="main-content">${pageHead('Profile', 'Manage your personal information.', '', '/patient/home')}
    <div class="split"><section class="card col" style="align-items:center;text-align:center">${avatar('PP', 'lg')}<h2 class="h2">${esc(user.name)}</h2><p class="tiny">${esc(user.email)}</p><button class="btn ghost sm" data-act="toast" data-msg="Edit profile (prototype)">Edit profile</button></section>
      <section class="card col"><div class="tabs" role="tablist" aria-label="Profile sections">${['Personal details', 'Health info', 'Emergency contact'].map(k => `<button role="tab" aria-selected="${k === tab}" data-act="ptab" data-v="${k}">${k}</button>`).join('')}</div>${body}</section></div>
    <div class="list" style="max-width:520px"><button class="item" data-act="go" data-to="/patient/settings"><span class="ibox">${icon('gear', 'sm')}</span><span class="grow t">Settings, privacy & consent</span>${icon('chevR', 'sm')}</button><button class="item" data-act="logout"><span class="ibox bad">${icon('logout', 'sm')}</span><span class="grow t">Log out</span></button></div></main>`;
}

const sw = (id, label, desc, on) => `<div class="row sb item" style="gap:14px"><span class="grow"><span class="t" id="l-${id}">${label}</span><br><span class="s" id="d-${id}">${desc}</span></span><button class="toggle" role="switch" aria-checked="${on}" aria-labelledby="l-${id}" aria-describedby="d-${id}" data-act="sw" data-k="${id}"></button></div>`;

export function settings(st) {
  const s = st.settings, th = st.theme;
  return `<main class="page" id="main-content" style="max-width:760px;margin:0 auto;width:100%">${pageHead('Settings', 'Your preferences and account settings.', '', '/patient/profile')}
    <section class="card col" aria-labelledby="ap"><h2 class="h2" id="ap">Appearance</h2><div class="tabs" role="tablist" aria-label="Theme">${[['light', 'Light', 'sun'], ['dark', 'Dark', 'moon'], ['system', 'System', 'gear']].map(([k, l]) => `<button role="tab" aria-selected="${th === k}" data-act="theme" data-v="${k}">${l}</button>`).join('')}</div><p class="cap">Applies to the whole app. Both themes meet AA contrast.</p></section>
    <section class="card col" aria-labelledby="nt"><h2 class="h2" id="nt">Notifications</h2>${sw('reminders', 'Measurement reminders', 'Reminders that fit your daily routine.', s.reminders)}${sw('alerts', 'Care team messages and alerts', 'Reading reviews and updates from your care team.', s.alerts)}${sw('marketing', 'Tips and news', 'Optional health tips.', s.marketing)}</section>
    <section class="card col" aria-labelledby="pv"><h2 class="h2" id="pv">Privacy & sharing</h2>${sw('caregiver', 'Caregiver access', 'Let a family member see your readings and reminders. You can turn this off any time.', s.caregiver)}
      <div class="item"><span class="grow"><span class="t">Consent</span><br><span class="s">Version 2.1 · Agreed 10 Jan 2026</span></span><button class="btn ghost sm" data-act="toast" data-msg="Consent history would open here.">View history</button></div>
      <button class="link" data-act="toast" data-msg="You can withdraw consent. Remote monitoring may stop until you agree again.">Withdraw consent</button></section>
    <section class="card col"><h2 class="h2">Language & units</h2><div class="grid g2"><div class="field"><label for="lg">Language</label><select id="lg" class="input"><option>English</option><option>हिन्दी</option><option>ಕನ್ನಡ</option></select></div><div class="field"><label for="un">Units</label><select id="un" class="input"><option>Metric (kg, cm)</option><option>Imperial (lb, in)</option></select></div></div></section>
    <button class="btn ghost" data-act="logout" style="align-self:flex-start">${icon('logout', 'sm')}Log out</button></main>`;
}

export const acts = {
  ptab: el => set({ pTab: el.dataset.v }),
  sw: el => set(s => ({ settings: { ...s.settings, [el.dataset.k]: !s.settings[el.dataset.k] } })),
  theme: el => set({ theme: el.dataset.v }),
  logout: () => { set({ authed: false, slide: 0, ai: null }); location.hash = '#patient-roles'; },
};
