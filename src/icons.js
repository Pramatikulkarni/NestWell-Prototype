// Inline stroke icons (24×24). Decorative by default; pair with visible text or aria-label.
const P = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.800 2.600 4 5.600 4 9s-1.200 6.400-4 9c-2.800-2.600-4-5.600-4-9s1.200-6.400 4-9z"/>',
  sparkle: '<path d="M12 3l1.900 5.100L19 10l-5.100 1.900L12 17l-1.900-5.100L5 10l5.100-1.900z"/><path d="M19 15.500l.800 2.200 2.200.800-2.200.800-.800 2.200-.800-2.200-2.200-.800 2.200-.800zM5 3.500l.600 1.600 1.600.600-1.600.6L5 7.900l-.600-1.600-1.600-.6 1.600-.6z"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  heart: '<path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.6 4.5 6.8 4.5c2 0 3.5 1 5.2 3 1.7-2 3.2-3 5.2-3 3.200 0 5 3.100 3.800 6.300C19 15.600 12 20 12 20z"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  device: '<rect x="6" y="2.500" width="12" height="19" rx="3"/><path d="M10 6.500h4M12 17.500h.01"/>',
  plan: '<rect x="5" y="3.500" width="14" height="17" rx="3"/><path d="M9 3.500v2h6v-2M9 11l2 2 4-4M9 17h6"/>',
  book: '<path d="M4 5.500A2.500 2.500 0 016.500 3H20v15H6.500A2.500 2.500 0 004 20.500z"/><path d="M4 20.500A2.500 2.500 0 006.500 23H20"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.200 3.600-7 8-7s8 2.800 8 7"/>',
  users: '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-3.500 3-6 6.500-6s6.500 2.500 6.500 6"/><path d="M16 4.500a3.500 3.500 0 010 7M18 14c2.300.700 3.500 2.800 3.500 5"/>',
  bell: '<path d="M6 17V11a6 6 0 1112 0v6l1.500 2h-15z"/><path d="M10 21h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 00.300 1.800l.1.100a2 2 0 11-2.800 2.800l-.1-.1a1.700 1.700 0 00-1.800-.3 1.700 1.700 0 00-1 1.500V21a2 2 0 11-4 0v-.1a1.700 1.700 0 00-1.100-1.500 1.700 1.700 0 00-1.800.3l-.1.100a2 2 0 11-2.800-2.800l.1-.1a1.700 1.700 0 00.3-1.800 1.700 1.700 0 00-1.500-1H3a2 2 0 110-4h.1a1.700 1.700 0 001.500-1.100 1.700 1.700 0 00-.3-1.800l-.1-.1a2 2 0 112.800-2.800l.1.100a1.700 1.700 0 001.800.3H9a1.700 1.700 0 001-1.500V3a2 2 0 114 0v.1a1.700 1.700 0 001 1.500 1.700 1.700 0 001.800-.3l.1-.1a2 2 0 112.800 2.800l-.1.100a1.700 1.700 0 00-.3 1.800V9a1.700 1.700 0 001.500 1H21a2 2 0 110 4h-.1a1.700 1.700 0 00-1.500 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  chevR: '<path d="M9 5l7 7-7 7"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>',
  warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500h.01"/>',
  octagon: '<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M12 8v5M12 16h.01"/>',
  wifiOff: '<path d="M2 8.800a15 15 0 0120 0M5 12.500a10 10 0 0114 0M8.500 16a5 5 0 017 0M12 19.500h.01M3 3l18 18"/>',
  battery: '<rect x="2" y="7" width="17" height="10" rx="2.500"/><path d="M22 11v2M6 10v4M10 10v4"/>',
  phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  video: '<rect x="2" y="6" width="13" height="12" rx="3"/><path d="M15 10l7-3v10l-7-3z"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.500 1.500M17.500 17.500L19 19M19 5l-1.500 1.500M6.500 17.500L5 19"/>',
  moon: '<path d="M20 14.500A8 8 0 019.500 4 8 8 0 1020 14.500z"/>',
  logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  drop: '<path d="M12 3s6 6.500 6 11a6 6 0 01-12 0c0-4.500 6-11 6-11z"/>',
  steps: '<path d="M7 20c-1.500 0-2.500-1-2.500-2.500S5.500 14 6.500 11 8 6 9.500 6s2 1.500 1.500 4-.5 4-1 6-1.500 4-3 4zM17 18c1.500 0 2.500-1 2.500-2.500S18.500 12 17.500 9 16 4 14.500 4s-2 1.500-1.500 4 .5 4 1 6 1.500 4 3 4z"/>',
  thermo: '<path d="M14 14.500V5a2 2 0 10-4 0v9.500a4 4 0 104 0z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  refresh: '<path d="M21 12a9 9 0 01-15.500 6.200M3 12A9 9 0 0118.500 5.800M18.500 2v4h-4M5.500 22v-4h4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.500 8.500-8 9.500C7.500 20.500 4 17 4 12V6z"/><path d="M9 12l2 2 4-4"/>',
  more: '<circle cx="5" cy="12" r="1.500"/><circle cx="12" cy="12" r="1.500"/><circle cx="19" cy="12" r="1.500"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};
export const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n] || ''}</svg>`;

// NestWell logo from the case study: an N whose right stem curves into a protective arc that holds the patient dot.
export const logoMark = (h = 92) => `<svg class="logo-mark" width="${Math.round(h * 250 / 302)}" height="${h}" viewBox="0 0 250 302" role="img" aria-label="NestWell logo"><g fill="none" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"><path class="ls" d="M26 276V26l170 250"/><path class="ls" d="M196 26Q264 151 196 276"/></g><circle class="ld" cx="146" cy="92" r="26"/></svg>`;
export const lockup = (h = 38) => `<span class="lockup">${logoMark(h)}<span class="logo-word">nestwell</span></span>`;
export const ecg = () => `<svg class="ecg" viewBox="0 0 300 56" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="300" d="M0 30H60L70 30L78 8L90 52L98 30H150L158 30L166 8L178 52L186 30H300"/></svg>`;
export const tick = () => `<svg class="tick" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.500 4.500L19 7.500"/></svg>`;

export const liveEcg = () => {
  const beat = 'M0 30H18L24 30L30 8L38 52L44 30H100';
  const path = Array.from({ length: 6 }, (_, i) => `M${i * 100} 30H${i * 100 + 18}L${i * 100 + 24} 30L${i * 100 + 30} 8L${i * 100 + 38} 52L${i * 100 + 44} 30H${i * 100 + 100}`).join('');
  return `<div class="live-ecg" aria-hidden="true"><svg viewBox="0 0 300 60" preserveAspectRatio="none" focusable="false"><g class="sweep"><path d="${path}"/></g></svg><span class="scan"></span></div>`;
};
