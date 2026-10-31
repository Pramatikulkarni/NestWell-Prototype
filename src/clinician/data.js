// Clinician sample data. Everything here is illustrative prototype data. Prakash Paul is the one patient wired to the live patient app state.
import { liveNow } from '../live.js';
import { linkStatus } from '../views/common.js';

const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const gen = (base, spread, n, seed) => { const r = rng(seed); return Array.from({ length: n }, (_, i) => Math.round(base + Math.sin(i / 1.3) * spread * .5 + (r() - .5) * spread)); };
export const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const base = [
  { id: 'p2', name: 'John Mathew', mrn: 'NW-00398', age: 62, sex: 'Male', cond: 'Hypertension', status: 'critical', hr: 96, sys: 178, dia: 102, spo2: 94, temp: 36.9, last: '178/102 mmHg', seed: 11, device: 'ok' },
  { id: 'p3', name: 'Latha Raman', mrn: 'NW-00318', age: 58, sex: 'Female', cond: 'COPD', status: 'warning', hr: 88, sys: 126, dia: 82, spo2: 88, temp: 36.7, last: 'SpO₂ 88%', seed: 23, device: 'ok' },
  { id: 'p4', name: 'Ramesh Kulkarni', mrn: 'NW-00276', age: 63, sex: 'Male', cond: 'Cardiac care', status: 'warning', hr: 128, sys: 134, dia: 86, spo2: 96, temp: 36.8, last: 'HR 128 bpm', seed: 37, device: 'ok' },
  { id: 'p5', name: 'Priya Sharma', mrn: 'NW-00612', age: 34, sex: 'Female', cond: 'Pregnancy', status: 'stable', hr: 78, sys: 120, dia: 80, spo2: 98, temp: 36.6, last: '120/80 mmHg', seed: 41, device: 'ok' },
  { id: 'p6', name: 'Arun Nair', mrn: 'NW-00587', age: 50, sex: 'Male', cond: 'Hypertension', status: 'follow', hr: 82, sys: 142, dia: 90, spo2: 97, temp: 36.6, last: '142/90 mmHg', seed: 53, device: 'ok' },
  { id: 'p7', name: 'Meera Pillai', mrn: 'NW-00490', age: 28, sex: 'Female', cond: 'Asthma', status: 'stable', hr: 74, sys: 112, dia: 72, spo2: 95, temp: 36.5, last: 'SpO₂ 95%', seed: 67, device: 'down' },
];

export function patients(st) {
  const live = liveNow(), ls = linkStatus(st);
  const bp = (st.readings.find(r => r.metric === 'bp') || { value: '118/76' }).value, [sys, dia] = String(bp).split('/').map(Number);
  const flagged = st.readings.some(r => r.flag === 'high');
  const p1 = { id: 'p1', name: 'Prakash Paul', mrn: 'NW-00421', age: 71, sex: 'Male', cond: 'Hypertension', hr: live.hr, sys, dia, spo2: live.spo2, temp: 36.6, last: `${bp} mmHg`, seed: 7, live: true,
    status: flagged ? 'critical' : ls.down.length || st.offline ? 'follow' : 'stable', device: ls.down.length || st.offline ? 'down' : 'ok' };
  return [p1, ...base];
}
export const byId = (st, id) => patients(st).find(p => p.id === id) || patients(st)[0];

export const seriesFor = (p, k) => {
  const b = { hr: p.hr, sys: p.sys, dia: p.dia, spo2: p.spo2 }[k];
  const sp = { hr: 12, sys: 14, dia: 8, spo2: 2 }[k];
  return gen(b, sp, 7, p.seed + k.length).map(v => k === 'spo2' ? Math.min(100, v) : v);
};

export function alerts(st) {
  const ps = patients(st), P = id => ps.find(p => p.id === id);
  const out = [
    { id: 'a2', pid: 'p2', sev: 'critical', title: 'Blood pressure above range', value: '178/102 mmHg', when: '2 min ago' },
    { id: 'a3', pid: 'p3', sev: 'warning', title: 'Low SpO₂', value: '88%', when: '8 min ago' },
    { id: 'a4', pid: 'p4', sev: 'warning', title: 'High heart rate', value: '128 bpm', when: '12 min ago' },
    { id: 'a7', pid: 'p7', sev: 'info', title: 'Device disconnected', value: 'Pulse oximeter', when: '20 min ago' },
    { id: 'a6', pid: 'p6', sev: 'warning', title: 'Irregular blood pressure', value: '142/90 mmHg', when: '1 hour ago' },
  ];
  if (st.readings.some(r => r.flag === 'high')) out.unshift({ id: 'a1', pid: 'p1', sev: 'critical', title: 'Blood pressure above range', value: (st.readings.find(r => r.flag === 'high') || {}).value + ' mmHg', when: 'just now' });
  const down = st.devices.filter(d => d.state !== 'connected');
  if (down.length) out.push({ id: 'a1d', pid: 'p1', sev: 'info', title: 'Device disconnected', value: down[0].name, when: '3 hours ago' });
  if (st.offline) out.push({ id: 'a1o', pid: 'p1', sev: 'info', title: 'Patient app offline', value: 'Readings not arriving', when: 'now' });
  return out.map(a => ({ ...a, p: P(a.pid), reviewed: !!(st.cRev && st.cRev[a.id]) }));
}

export const sampleThreads = {
  p2: [{ from: 'them', text: 'My BP reading looks higher today. Should I be concerned?', t: '10:30 AM' }],
  p3: [{ from: 'them', text: 'Feeling a bit breathless this morning.', t: '9:45 AM' }],
  p4: [{ from: 'them', text: 'Thank you for the reminder.', t: '9:20 AM' }],
  p5: [{ from: 'them', text: 'My lab results have arrived. Can we review them?', t: '8:15 AM' }],
  p6: [{ from: 'them', text: 'Is it fine to take the medication after breakfast?', t: 'Yesterday' }],
  p7: [{ from: 'them', text: 'My pulse oximeter is not pairing.', t: 'Yesterday' }],
};

export const team = [
  { name: 'Dr. Kavya Iyer', role: 'Cardiologist', tag: 'You · primary clinician', init: 'KI' },
  { name: 'Dr. Ananya Rao', role: 'Cardiologist', tag: 'On duty', init: 'AR' },
  { name: 'Dr. Arjun Menon', role: 'General physician', tag: 'On duty', init: 'AM' },
  { name: 'Nurse Priya', role: 'Care coordinator', tag: 'On duty', init: 'NP' },
  { name: 'Neha Bhatia', role: 'Pulmonology nurse', tag: 'Off duty', init: 'NB' },
  { name: 'Suresh Reddy', role: 'Lab technician', tag: 'On duty', init: 'SR' },
];
