import { icon, logoMark, ecg } from '../icons.js';
import { set } from '../store.js';
import { backBtn, esc, avatar } from './common.js';
import { roles, providers } from '../data.js';
import { t } from '../i18n.js';

const slides = [
  { t: 'Track', d: 'Take the measurements your care team asked for, right at home.' },
  { t: 'Thrive', d: 'See plain-language trends, and know what to do next.' },
  { t: 'Together', d: 'Your care team can see what you share. You stay in control.' },
];

export function welcome(st) {
  const s = slides[st.slide];
  return `<main class="splash" id="main-content"><h1 class="sr-only" id="page-title" tabindex="-1">Welcome to NestWell</h1>
    <div class="halo">${logoMark(104)}</div><div class="logo-word" aria-hidden="true">nestwell</div>
    <p class="logo-tag">Care that stays close</p><div style="width:150px">${ecg()}</div>
    <div class="card" style="max-width:320px;text-align:center" aria-live="polite"><h2 class="h2">${s.t}</h2><p class="muted" style="margin-top:6px">${s.d}</p></div>
    <div class="dots" aria-hidden="true">${slides.map((_, i) => `<i class="${i === st.slide ? 'on' : ''}"></i>`).join('')}</div>
    <div class="col" style="width:100%;max-width:320px">
      ${st.slide > 0 ? `<button class="back iconback" data-act="slide-back" aria-label="Previous slide" style="align-self:center">${icon('chevL')}</button>` : ''}
      ${st.slide < 2 ? `<button class="btn primary block" data-act="slide">Next</button><button class="link" data-act="go" data-to="/patient/login" style="justify-content:center">Skip</button>`
        : `<button class="btn primary block" data-act="go" data-to="/patient/login">Get started ${icon('chevR', 'sm')}</button>`}
      <button class="link" data-act="go" data-to="/patient/login" style="justify-content:center">I already have an account</button>
    </div>
    <p class="cap" style="max-width:300px">NestWell supports your care. It does not replace your care team or provide emergency monitoring.</p></main>`;
}

export function login(st) {
  const role = roles.find(r => r.id === st.role) || roles[0];
  const sel = st.provider || '';
  return `<div class="auth-split" id="main-content"><div class="art"><div class="halo">${logoMark(120)}</div><div class="logo-word">nestwell</div><p class="logo-tag">Care that stays close</p><div style="width:170px">${ecg()}</div></div>
    <main class="auth-wrap"><div class="phone-only col" style="align-items:center;text-align:center">${logoMark(66)}<div class="logo-word" style="font-size:30px">nestwell</div></div>
    <div class="hasback">${backBtn('/patient/roles', 'Back to login types', 'go', true)}<h1 class="h1" id="page-title" tabindex="-1">${esc(t(st, role.id))} ${esc(t(st, 'loginTitle'))}</h1><p class="muted">${esc(t(st, 'loginSub'))}</p></div>
    <form class="col" data-form="login" novalidate>
      <div class="field"><label for="cp">${esc(t(st, 'provider'))}</label>
        <select id="cp" class="input" aria-describedby="cp-e"><option value="" ${sel ? '' : 'selected'} disabled>${esc(t(st, 'selectHosp'))}</option>${providers.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)} · ${esc(p.area)}</option>`).join('')}</select><span id="cp-e" class="cap" role="alert"></span></div>
      <div class="field"><label for="em">${esc(role.idLabel)}</label><input id="em" class="input" type="text" autocomplete="username" placeholder="${esc(role.idHint)}" aria-describedby="em-e"><span id="em-e" class="cap" role="alert"></span></div>
      <div class="field"><label for="pw">${esc(t(st, 'password'))}</label><div style="position:relative"><input id="pw" class="input" type="password" autocomplete="current-password" placeholder="${esc(t(st, 'pwPh'))}" aria-describedby="pw-e"><button type="button" class="link" data-act="togglepw" aria-label="Show password" style="position:absolute;right:6px;top:2px;padding:0 10px">${icon('eye', 'sm')}</button></div><span id="pw-e" class="cap" role="alert"></span></div>
      <label class="row" style="min-height:44px"><input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--brand)"> ${esc(t(st, 'keep'))}</label>
      <button class="btn primary block" type="submit">${esc(t(st, 'login'))}</button>
    </form>
    <p class="cap" style="text-align:center">${role.id === 'patient' ? 'Your patient ID and first password come from your care provider.' : 'Your ID and password are issued by your care provider.'} Prototype: any details will work once a hospital is selected.</p></main></div>`;
}

export function consent(st) {
  const cards = [
    ['drop', 'What we collect', 'Readings from your devices (value, unit, time and source), symptoms you report, and your profile.'],
    ['users', 'Who can see it', 'Your care team. A caregiver, only if you give permission. Never shared for advertising.'],
    ['shield', 'How it is used', 'To support your care plan and flag readings for review by a clinician. It does not diagnose.'],
    ['gear', 'Your choices', 'Change or withdraw consent any time in Settings. Withdrawing may limit remote monitoring.'],
  ];
  return `<main class="auth-wrap" id="main-content" style="max-width:720px;margin:0 auto;width:100%"><div class="hasback">${backBtn('/patient/login', 'Back to sign in', 'go', true)}<h1 class="h1" id="page-title" tabindex="-1">Your health information is sensitive</h1><p class="muted">Here is how NestWell handles it. Please read before you continue.</p></div>
    <div class="grid g2 g-d2">${cards.map(([i, t, d]) => `<div class="card flat col" style="gap:8px"><span class="ibox">${icon(i)}</span><h2 class="h2">${t}</h2><p class="tiny">${d}</p></div>`).join('')}</div>
    <p><button class="link" data-act="toast" data-msg="Full privacy notice (v2.1) would open here.">Read the full privacy notice</button></p>
    <label class="row" style="align-items:flex-start;min-height:44px"><input id="agree" type="checkbox" data-act="agree" ${st.agreeTick ? 'checked' : ''} style="width:22px;height:22px;margin-top:2px;accent-color:var(--brand)"><span>I have read this and I agree to share my readings with my care team. <span class="cap">Consent v2.1 · recorded with date and time.</span></span></label>
    <div class="row" style="flex-wrap:wrap"><button class="btn primary" data-act="accept-consent" ${st.agreeTick ? '' : 'disabled aria-disabled="true"'}>Agree and continue</button><button class="btn ghost" data-act="decline-consent">Not now</button></div></main>`;
}

export const decline = () => `<main class="auth-wrap" id="main-content" style="max-width:560px;margin:0 auto"><div class="hasback">${backBtn('/patient/consent', 'Back to consent', 'go', true)}<h1 class="h1" id="page-title" tabindex="-1">No problem</h1></div><p class="muted">Without consent, NestWell cannot share your readings with your care team. Your care team can still support you in other ways. Contact them at your clinic if you have questions.</p><div class="row" style="flex-wrap:wrap"><button class="btn primary" data-act="go" data-to="/patient/consent">Review consent again</button><button class="btn ghost" data-act="go" data-to="/patient/welcome">Exit setup</button></div></main>`;

export const acts = {
  'slide-back': () => set(s => ({ slide: Math.max(0, s.slide - 1) })),
  slide: () => set(s => ({ slide: Math.min(2, s.slide + 1) })),
  togglepw: el => { const i = document.getElementById('pw'); i.type = i.type === 'password' ? 'text' : 'password'; el.setAttribute('aria-label', i.type === 'password' ? 'Show password' : 'Hide password'); },
  agree: el => set({ agreeTick: el.checked }),
  'accept-consent': () => { set({ consented: true }); location.hash = '#patient-home'; },
  'decline-consent': () => { location.hash = '#patient-declined'; },
};

export function finishLogin() {
  const role = get().role || 'patient';
  set({ authed: true });
  location.hash = '#patient-' + (role === 'patient' ? (get_consented() ? 'home' : 'consent') : role === 'clinician' ? 'c-dashboard' : 'a-overview');
}

export function submitLogin(form) {
  const cp = form.querySelector('#cp'), em = form.querySelector('#em'), pw = form.querySelector('#pw');
  const e0 = form.querySelector('#cp-e'), e1 = form.querySelector('#em-e'), e2 = form.querySelector('#pw-e');
  const role = roles.find(r => r.id === get().role) || roles[0];
  e0.textContent = cp.value ? '' : 'Select your care provider.';
  e1.textContent = em.value.trim() ? '' : `Enter your ${role.idLabel}.`;
  e2.textContent = pw.value.length >= 4 ? '' : 'Enter your password (at least 4 characters).';
  const bad = [[e0, cp], [e1, em], [e2, pw]].find(([e]) => e.textContent);
  if (bad) { bad[1].focus(); return; }
  set({ provider: cp.value });
  const btn = form.querySelector('button[type=submit]'); btn.classList.add('loading'); btn.setAttribute('aria-busy', 'true'); btn.lastChild.textContent = ' Signing in…';
  setTimeout(finishLogin, 800);
}
import { get } from '../store.js';
const get_consented = () => get().consented;
