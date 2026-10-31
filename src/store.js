import { tasks, devices, notifications, messages } from './data.js';

const KEY = 'nestwell-proto-v1';
const defaults = () => ({
  theme: 'light',            // light | dark | system
  device: 'desktop',         // phone | desktop | full (prototype frame)
  authed: false,
  cPid: 'p1', cTab: 'overview', cThread: 'p1', cOpen: false, cRev: {}, cMsgs: {}, cSet: {}, aInact: { 'u-p4': true }, aAddList: {}, aRes: {}, aPub: {}, aCfg: {},
  lang: 'en',
  provider: '',               // care provider chosen at login
  role: 'patient',            // patient | clinician | admin
  consented: false,
  slide: 0,
  route: '/patient/splash',
  // simulated conditions
  offline: false,
  sim: { result: 'normal', pairFail: false },
  // data
  tasks: tasks.map(t => ({ ...t })),
  devices: devices.map(d => ({ ...d })),
  notifications: notifications.map(n => ({ ...n })),
  messages: messages.map(m => ({ ...m })),
  readings: [{ id: 'r0', metric: 'bp', value: '118/76', unit: 'mmHg', at: 'Today, 7:40 AM', source: 'Blood pressure monitor', sync: 'synced' }],
  settings: { reminders: true, alerts: true, marketing: false, caregiver: false, units: 'metric' },
  measure: null,             // active measurement flow
});

let state = defaults();
try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}'), { measure: null, pair: null, more: false, nOpen: null, article: null, ai: null, aAdd: null, about: null }); } catch { /* ignore */ }
const subs = new Set();
export const get = () => state;
export function set(patch) {
  Object.assign(state, typeof patch === 'function' ? patch(state) : patch);
  try { const { measure, ai, aAdd, about, ...keep } = state; localStorage.setItem(KEY, JSON.stringify(keep)); } catch { /* ignore */ }
  subs.forEach(f => f(state));
}
export const subscribe = f => (subs.add(f), () => subs.delete(f));
export const reset = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } state = defaults(); subs.forEach(f => f(state)); };
