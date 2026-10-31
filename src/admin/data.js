// Admin sample data (illustrative). Derived from the patient and clinician data where possible so all three portals agree.
import { patients, team, alerts as cAlerts } from '../clinician/data.js';
import { resources } from '../data.js';

const slug = n => n.toLowerCase().replace(/^(dr\.|nurse)\s+/, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.');
const extra = (st, k) => ((st.aAddList || {})[k]) || [];

export function users(st) {
  const inact = st.aInact || {};
  const pts = patients(st).map((p, i) => ({ id: 'u-' + p.id, name: p.name, role: 'Patient', email: slug(p.name) + '@example.com', last: ['Today, 10:24 AM', 'Today, 09:15 AM', 'Today, 08:42 AM', 'Today, 11:02 AM', '3 days ago', 'Today, 07:55 AM', 'Yesterday'][i] || 'Today' }));
  const staff = team.map((m, i) => ({ id: 'u-t' + i, name: m.name, role: 'Clinician', email: slug(m.name) + '@example.com', last: ['Today, 10:02 AM', 'Today, 09:40 AM', 'Today, 08:12 AM', 'Today, 11:15 AM', 'Yesterday', 'Today, 09:05 AM'][i] }));
  const adm = [{ id: 'u-a1', name: 'Rohan Deshmukh', role: 'Admin', email: 'rohan.deshmukh@example.com', last: 'Today, 11:20 AM' }];
  return [...staff, ...pts, ...adm, ...extra(st, 'user').map((u, i) => ({ id: 'u-x' + i, last: 'Just now', ...u }))].map(u => ({ ...u, active: !inact[u.id] }));
}

export function devices(st) {
  const kind = { bp: 'NW-BP-0012', ox: 'NW-SPO2-0204', sc: 'NW-WT-0781', at: 'NW-ACT-0310' };
  const mine = st.devices.map(d => ({ id: kind[d.id] || 'NW-' + d.id.toUpperCase(), type: d.name, who: 'Prakash Paul', status: d.state === 'connected' ? 'Online' : 'Offline', battery: d.battery, sync: d.synced }));
  const rest = [
    { id: 'NW-SPO2-0345', type: 'Pulse oximeter', who: 'Latha Raman', status: 'Online', battery: 72, sync: '12 min ago' },
    { id: 'NW-GLU-0103', type: 'Glucose monitor', who: 'Meera Pillai', status: 'Online', battery: 60, sync: '15 min ago' },
    { id: 'NW-TEMP-0145', type: 'Thermometer', who: 'Priya Sharma', status: 'Issue', battery: 20, sync: '1 hour ago' },
    { id: 'NW-ECG-0098', type: 'ECG monitor', who: 'John Mathew', status: 'Online', battery: 88, sync: '2 min ago' },
    { id: 'NW-WT-0415', type: 'Smart scale', who: 'Ramesh Kulkarni', status: 'Offline', battery: 14, sync: '2 hours ago' },
  ];
  return [...mine, ...rest, ...extra(st, 'device').map(d => ({ who: 'Unassigned', status: 'Online', battery: 100, sync: 'Just now', ...d }))];
}

export function programmes(st) {
  const ps = patients(st), n = c => ps.filter(p => c.includes(p.cond)).length;
  const base = [
    { id: 'g1', name: 'Hypertension Management', enrolled: n(['Hypertension']), status: 'Active', ic: 'heart' },
    { id: 'g2', name: 'Cardiac Health', enrolled: n(['Cardiac care']), status: 'Active', ic: 'pulse' },
    { id: 'g3', name: 'COPD Care', enrolled: n(['COPD', 'Asthma']), status: 'Active', ic: 'drop' },
    { id: 'g4', name: 'Maternal Care', enrolled: n(['Pregnancy']), status: 'Active', ic: 'leaf' },
    { id: 'g5', name: 'Weight Management', enrolled: 0, status: 'Draft', ic: 'steps' },
    { id: 'g6', name: 'Post-Surgery Recovery', enrolled: 0, status: 'Draft', ic: 'plan' },
    { id: 'g7', name: 'Diabetes Care', enrolled: 0, status: 'Archived', ic: 'thermo' },
  ];
  return [...base, ...extra(st, 'programme').map((p, i) => ({ id: 'gx' + i, enrolled: 0, status: 'Draft', ic: 'plan', ...p }))];
}

export function incidents(st) {
  const sys = [
    { id: 's1', sev: 'info', title: 'Software update available', value: 'System', when: '1 hour ago', who: 'System' },
    { id: 's2', sev: 'info', title: 'New user registration', value: 'Priya Sharma', when: '1 hour ago', who: 'Priya Sharma' },
  ];
  const clin = cAlerts(st).map(a => ({ id: 'i' + a.id, sev: a.sev, title: a.title, value: a.value, when: a.when, who: a.p.name }));
  const res = st.aRes || {};
  return [...clin, ...sys].map(a => ({ ...a, resolved: !!res[a.id] }));
}

export const audit = [
  { when: '14 Oct 2026, 10:32 AM', who: 'Rohan Deshmukh', action: 'Updated', entity: 'System settings', detail: 'Notification preferences updated' },
  { when: '14 Oct 2026, 09:15 AM', who: 'Dr. Ananya Rao', action: 'Viewed', entity: 'Patient record', detail: 'Viewed patient Prakash Paul’s data' },
  { when: '14 Oct 2026, 09:12 AM', who: 'Nurse Priya', action: 'Created', entity: 'Care plan', detail: 'New care plan created' },
  { when: '14 Oct 2026, 08:21 AM', who: 'System', action: 'Alert', entity: 'User', detail: 'New user registered' },
  { when: '14 Oct 2026, 07:28 AM', who: 'Rohan Deshmukh', action: 'Added', entity: 'Device', detail: 'Added new device NW-WT-0415' },
  { when: '13 Oct 2026, 11:05 PM', who: 'System', action: 'Alert', entity: 'Device', detail: 'Device offline NW-WT-0781' },
  { when: '13 Oct 2026, 04:32 PM', who: 'Dr. Kavya Iyer', action: 'Updated', entity: 'Profile', detail: 'Updated notification settings' },
  { when: '13 Oct 2026, 10:10 AM', who: 'Dr. Arjun Menon', action: 'Reviewed', entity: 'Alert', detail: 'Reviewed a blood pressure alert' },
];

export function content(st) {
  const pub = st.aPub || {};
  const base = resources.map((r, i) => ({ id: r.id, title: r.title, type: r.type, topic: r.cat, updated: ['12 Oct 2026', '10 Oct 2026', '8 Oct 2026', '6 Oct 2026', '5 Oct 2026', '3 Oct 2026'][i] || '1 Oct 2026', published: pub[r.id] !== undefined ? pub[r.id] : i < 4 }));
  return [...base, ...extra(st, 'content').map((c, i) => ({ id: 'cx' + i, topic: 'General', updated: 'Just now', published: false, ...c }))];
}

export const faqs = [
  ['Getting started', [['How do I set up my account?', 'Sign in with the ID issued by your care provider, then choose your care provider from the list.'], ['How do I invite a clinician?', 'Open Users, choose Add user, pick the Clinician role and enter their email.']]],
  ['Device setup', [['How do I add a device?', 'Open Devices, choose Add device and enter its ID and type.'], ['A device shows Offline. What now?', 'Ask the patient to check the device is on and near their phone. Offline devices are a technical issue, not a health alert.']]],
  ['Alerts & incidents', [['How do I resolve an incident?', 'Open Alerts, then choose Resolve on the incident. Resolved items stay in the audit log.']]],
  ['Reports', [['Where can I see programme results?', 'Open Analytics and choose the Programme outcomes tab.']]],
];
