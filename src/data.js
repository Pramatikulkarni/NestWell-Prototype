// Simulated data for the prototype. No real patient data. Target ranges are illustrative and "set by the care team".
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export const user = { name: 'Prakash Paul', first: 'Prakash', email: 'prakash.paul@example.com', phone: '+91 98765 43210', dob: '12 Mar 1955', gender: 'Male', location: 'Bengaluru, India', emergency: 'Lalitha Paul (spouse)' };

export const careTeam = [
  { id: 'dr', name: 'Dr. Ananya Rao', role: 'Cardiologist', initials: 'AR', next: 'Next appointment · 15 Oct 2026, 10:00 AM' },
  { id: 'dr2', name: 'Dr. Arjun Menon', role: 'General physician', initials: 'AM', next: 'Reviews your readings weekly' },
  { id: 'rn', name: 'Nurse Priya', role: 'Care coordinator', initials: 'NP', next: 'Replies during working hours' },
];

export const targets = {
  hr: { label: 'Heart rate', unit: 'bpm', lo: 60, hi: 100, by: 'Dr. Rao' },
  bp: { label: 'Blood pressure', unit: 'mmHg', lo: '90/60', hi: '120/80', by: 'Dr. Rao' },
  spo2: { label: 'SpO₂', unit: '%', lo: 95, hi: 100, by: 'Dr. Rao' },
  temp: { label: 'Temperature', unit: '°C', lo: 36.1, hi: 37.2, by: 'Dr. Rao' },
};

const r = rng(42);
const base = { hr: 72, sys: 118, dia: 76, spo2: 98, temp: 36.6, steps: 6240 };
export function series(metric, range) {
  const n = range === 'day' ? 12 : range === 'week' ? 7 : 30;
  const rr = rng(metric.length * 97 + n);
  const labels = range === 'day' ? ['12AM','2AM','4AM','6AM','8AM','10AM','12PM','2PM','4PM','6PM','8PM','10PM'] : range === 'week' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : Array.from({ length: n }, (_, i) => String(i + 1));
  const spread = { hr: 14, sys: 9, dia: 6, spo2: 1.6, temp: 0.35, steps: 2600 }[metric];
  const v = Array.from({ length: n }, (_, i) => {
    const wave = Math.sin(i / (n / 5)) * spread * 0.5;
    const val = base[metric] + wave + (rr() - 0.5) * spread;
    return metric === 'temp' ? +val.toFixed(1) : metric === 'spo2' ? Math.min(100, Math.round(val)) : Math.round(val);
  });
  return { labels, values: v };
}

export const devices = [
  { id: 'bp', name: 'Blood pressure monitor', measures: 'bp', state: 'connected', battery: 100, synced: '5 min ago', icon: 'device' },
  { id: 'ox', name: 'Pulse oximeter', measures: 'spo2', state: 'connected', battery: 80, synced: '12 min ago', icon: 'drop' },
  { id: 'sc', name: 'Smart scale', measures: 'weight', state: 'disconnected', battery: 55, synced: '3 hours ago', icon: 'device' },
  { id: 'at', name: 'Activity tracker', measures: 'steps', state: 'connected', battery: 60, synced: '1 hour ago', icon: 'steps' },
];

export const tasks = [
  { id: 't1', title: 'Take morning medication', when: '8:00 AM', done: true, kind: 'med' },
  { id: 't2', title: 'Measure blood pressure', when: 'Morning', done: true, kind: 'bp' },
  { id: 't3', title: 'Measure SpO₂', when: 'Morning', done: false, kind: 'spo2' },
  { id: 't4', title: 'Log symptoms', when: 'Evening', done: false, kind: 'sym' },
  { id: 't5', title: 'Walk for 20 minutes', when: 'Afternoon', done: false, kind: 'walk' },
  { id: 't6', title: 'Breathing exercise', when: 'Evening', done: false, kind: 'breath' },
];

export const notifications = [
  { id: 'n1', cat: 'Updates', icon: 'plan', tone: 'info', title: 'Care plan updated', body: 'Your monitoring schedule has been updated by your care team.', ago: '2 min ago', unread: true },
  { id: 'n2', cat: 'Alerts', icon: 'warn', tone: 'warn', title: 'Reading needs review', body: 'Your 7:40 AM blood pressure reading is above the range set by your care team. Your care team has been notified.', ago: '1 hour ago', unread: true },
  { id: 'n3', cat: 'Alerts', icon: 'wifiOff', tone: 'bad', title: 'Smart scale disconnected', body: 'This is a device issue, not a health alert. Please check the scale is on and nearby.', ago: '3 hours ago', unread: false },
  { id: 'n4', cat: 'Updates', icon: 'clock', tone: 'ok', title: 'Appointment reminder', body: 'You have a virtual appointment tomorrow at 10:00 AM.', ago: '1 day ago', unread: false },
  { id: 'n5', cat: 'Updates', icon: 'leaf', tone: 'ok', title: 'Health tip', body: 'Staying active can help maintain a healthy heart.', ago: '2 days ago', unread: false },
];

export const messages = [
  { from: 'them', who: 'Dr. Rao', text: 'Your latest readings look good. Keep monitoring as planned.', t: '10:24 AM' },
  { from: 'me', text: 'Thank you! Should I continue the same medication?', t: '10:26 AM' },
  { from: 'them', who: 'Dr. Rao', text: 'Yes, please continue and let me know if you notice any changes.', t: '10:28 AM' },
];

export const resources = [
  { id: 'r1', cat: 'Heart health', type: 'Article', mins: 5, title: 'Understanding blood pressure', hue: '#24665a', body: ['Blood pressure is the force of blood pushing against the walls of your arteries. It is written as two numbers, such as 118/76.', 'The first number is the pressure when your heart beats. The second is the pressure between beats.', 'Your care team sets the range that is right for you. Use that range, not a general one, when you read your results.'] },
  { id: 'r2', cat: 'Nutrition', type: 'Guide', mins: 6, title: 'Healthy eating for a stronger heart', hue: '#8a5a0a', body: ['Build meals around vegetables, fruit, whole grains and lean protein.', 'Limit salty, processed and fried foods where you can.', 'If you have dietary advice from your care team, follow that first.'] },
  { id: 'r3', cat: 'Fitness', type: 'Video', mins: 4, title: 'Staying active at home', hue: '#245f9b', body: ['Short, regular movement adds up. A brisk walk, gentle stretching or climbing stairs all count.', 'Start small and build up. Stop and rest if you feel unwell.', 'Check your activity goals with your care team.'] },
  { id: 'r4', cat: 'Mental wellbeing', type: 'Article', mins: 4, title: 'Managing stress and sleep', hue: '#6a4c93', body: ['Stress and poor sleep can affect how you feel day to day.', 'Try a regular bedtime, a quiet wind-down and a few slow breaths.', 'Talk to your care team if worry or low mood is getting in the way.'] },
  { id: 'r5', cat: 'Medication', type: 'Guide', mins: 5, title: 'Medication adherence tips', hue: '#b4503c', body: ['Take medicines at the same time each day and keep them where you will see them.', 'Use a reminder, a pill box or a routine such as brushing your teeth.', 'Never stop or change a medicine without asking your care team.'] },
  { id: 'r6', cat: 'Fitness', type: 'Video', mins: 3, title: 'Breathing exercises for calm', hue: '#1b6b60', body: ['Sit comfortably. Breathe in slowly through your nose for four counts.', 'Breathe out gently for six counts. Repeat for a few minutes.', 'If you feel dizzy, return to normal breathing.'] },
];

export const careplan = {
  name: 'Cardiac health monitoring', period: 'Jan 2026 – Jan 2027', status: 'Active', updated: '12 Oct 2026',
  goals: [
    { icon: 'heart', title: 'Improve heart health', body: 'Maintain readings within the range set by your care team.' },
    { icon: 'steps', title: 'Stay active', body: 'Reach 10,000 steps most days.' },
    { icon: 'leaf', title: 'Healthy nutrition', body: 'Follow a balanced diet as advised.' },
    { icon: 'moon', title: 'Better sleep', body: 'Aim for 7–8 hours each night.' },
  ],
};

// the three portals (photos are illustrative; no individual names are shown)
export const roles = [
  { id: 'patient', label: 'Patient', initials: 'PP', icon: 'user', idLabel: 'Patient ID', idHint: 'e.g. PT-204815', blurb: 'Track your vitals, devices and care plan, and stay connected to your care team.' },
  { id: 'clinician', label: 'Clinician', initials: 'KI', icon: 'plan', idLabel: 'Clinician ID', idHint: 'e.g. CL-10482', blurb: 'Review patient readings, spot changes early and respond to your patients.' },
  { id: 'admin', label: 'Admin', initials: 'RD', icon: 'gear', idLabel: 'Admin ID', idHint: 'e.g. AD-00317', blurb: 'Manage programmes, devices and access so every patient stays connected.' },
];

// care providers for the login dropdown (Mumbai examples; list is illustrative)
export const providers = [
  { id: 'kdah', name: 'Sahyadri Heart & Care Hospital', area: 'Andheri West, Mumbai' },
  { id: 'lilavati', name: 'Arya Wellness Hospital', area: 'Bandra West, Mumbai' },
  { id: 'nanavati', name: 'Konkan Coast Medical Centre', area: 'Vile Parle West, Mumbai' },
  { id: 'hinduja', name: 'Mahim Bay Care Hospital', area: 'Mahim, Mumbai' },
  { id: 'jaslok', name: 'Pedder Hill Specialty Hospital', area: 'Pedder Road, Mumbai' },
  { id: 'breach', name: 'Seaview Family Hospital', area: 'Breach Candy, Mumbai' },
  { id: 'bombay', name: 'Marine Drive Care Institute', area: 'Marine Lines, Mumbai' },
  { id: 'wockhardt', name: 'Central Harbour Hospital', area: 'Mumbai Central, Mumbai' },
  { id: 'fortis', name: 'Mulund Green Hospital', area: 'Mulund West, Mumbai' },
  { id: 'tata', name: 'Parel Central Medical Institute', area: 'Parel, Mumbai' },
];
