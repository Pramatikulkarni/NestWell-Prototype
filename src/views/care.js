import { icon } from '../icons.js';
import { careTeam } from '../data.js';
import { set, get } from '../store.js';
import { esc, pageHead, avatar } from './common.js';

export function care(st) {
  return `<main class="page" id="main-content">
    ${pageHead('Care team', 'The people looking after you.', '', '/patient/home')}
    <div class="split even">
      <section class="col" aria-label="Your care team">${careTeam.map(c => `<div class="card hover row">${avatar(c.initials)}<div class="grow"><h2 class="h2">${esc(c.name)}</h2><p class="tiny">${esc(c.role)}</p><p class="cap">${esc(c.next)}</p></div>
        <button class="iconbtn" data-act="call" data-who="${esc(c.name)}" aria-label="Call ${esc(c.name)}" style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand)">${icon('phone', 'sm')}</button>
        <button class="iconbtn" data-act="go" data-to="/patient/messages" aria-label="Message ${esc(c.name)}" style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand)">${icon('chat', 'sm')}</button></div>`).join('')}
        <p class="cap">Your care team replies during working hours. For emergencies, call your local emergency number.</p></section>
      <section class="card col" aria-labelledby="qa"><h2 class="h2" id="qa">Quick actions</h2><div class="list">
        ${[['chat', 'Chat with care team', '/patient/messages'], ['phone', 'Request a call', null], ['plan', 'View care plan', '/patient/careplan'], ['warn', 'Report an issue', null]].map(([i, t, to]) => `<button class="item" data-act="${to ? 'go' : 'toast'}" data-to="${to || ''}" data-msg="${t === 'Request a call' ? 'Call requested. Nurse Priya will call during working hours.' : 'Issue report form would open here.'}"><span class="ibox">${icon(i, 'sm')}</span><span class="grow t">${t}</span>${icon('chevR', 'sm')}</button>`).join('')}</div></section>
    </div></main>`;
}

export function messages(st) {
  return `<main class="page" id="main-content" style="min-height:100%">
    ${pageHead('Messages & calls', 'Chat with your care team. Not for emergencies.', '', '/patient/care')}
    <div class="split even" style="grid-template-columns:260px 1fr">
      <section class="col desktop-only" aria-label="Conversations">${careTeam.map((c, i) => `<div class="item ${i === 0 ? 'unread' : ''}">${avatar(c.initials)}<span class="grow"><span class="t">${esc(c.name)}</span><br><span class="s">${esc(c.role)}</span></span></div>`).join('')}</section>
      <section class="card col" aria-label="Conversation with Dr. Ananya Rao" style="gap:10px">
        <div class="row sb"><div class="row">${avatar('AR')}<div><h2 class="h2">Dr. Ananya Rao</h2><p class="cap">Cardiologist</p></div></div>
          <div class="row" style="gap:6px"><button class="iconbtn" data-act="call" data-who="Dr. Rao" aria-label="Voice call" style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand)">${icon('phone', 'sm')}</button><button class="iconbtn" data-act="call" data-who="Dr. Rao (video)" aria-label="Video call" style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand)">${icon('video', 'sm')}</button></div></div>
        <hr class="divider"><div class="col" role="log" aria-live="polite" id="thread" style="min-height:220px">${st.messages.map(m => `<div class="msg ${m.from}"><span>${esc(m.text)}</span><div class="cap" style="${m.from === 'me' ? 'color:inherit;opacity:.85' : ''}">${esc(m.t)}</div></div>`).join('')}</div>
        <form class="row" data-form="msg"><label class="sr-only" for="mi">Message</label><input id="mi" class="input" placeholder="Type a message" autocomplete="off"><button class="btn primary" type="submit" aria-label="Send">${icon('send', 'sm')}</button></form>
        <p class="cap">Messages are read during working hours. For urgent symptoms, call your care team or local emergency number.</p></section>
    </div></main>`;
}

export const acts = {
  call: el => document.dispatchEvent(new CustomEvent('toast', { detail: `Calling ${el.dataset.who}… (prototype)` })),
};
export function sendMessage(form) {
  const i = form.querySelector('#mi'); const v = i.value.trim(); if (!v) return;
  const t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  set(s => ({ messages: [...s.messages, { from: 'me', text: v, t }] }));
  setTimeout(() => set(s => ({ messages: [...s.messages, { from: 'them', who: 'Care team', text: 'Thanks, we have your message. We’ll reply during working hours.', t: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }] })), 1400);
}
