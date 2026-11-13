const ICONS = {
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: [{ c: [11, 11, 7] }, 'm20 20-3.5-3.5'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M6 6l1 14h10l1-14', 'M10 11v5', 'M14 11v5'],
  edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'],
  download: ['M12 3v12', 'm8 11 4 4 4-4', 'M4 21h16'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  sun: [{ c: [12, 12, 4] }, 'M12 2v2', 'M12 20v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M2 12h2', 'M20 12h2', 'm4.9 19.1 1.4-1.4', 'm17.7 6.3 1.4-1.4'],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z'],
  check: ['M20 6 9 17l-5-5'],
  alert: [{ c: [12, 12, 10] }, 'M12 8v4', 'M12 16h.01'],
  info: [{ c: [12, 12, 10] }, 'M12 16v-4', 'M12 8h.01'],
  left: ['m15 18-6-6 6-6'],
  right: ['m9 18 6-6-6-6'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z', { c: [12, 12, 3] }],
  eyeOff: ['M17.9 17.9A10.7 10.7 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 4.1-5', 'M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2', 'm3 3 18 18'],
  dashboard: ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  transactions: ['m7 4-4 4 4 4', 'M3 8h14', 'm17 20 4-4-4-4', 'M21 16H7'],
  wallet: ['M3 7a2 2 0 0 1 2-2h13v4', 'M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z', 'M16 14.5h.01'],
  target: [{ c: [12, 12, 10] }, { c: [12, 12, 6] }, { c: [12, 12, 2] }],
  layers: ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 13 9 5 9-5'],
  chart: ['M3 3v18h18', 'M8 17v-5', 'M13 17V8', 'M18 17v-9'],
  user: [{ c: [12, 8, 4] }, 'M4 21a8 8 0 0 1 16 0'],
  settings: ['M4 6h8', 'M16 6h4', 'M4 12h2', 'M10 12h10', 'M4 18h10', 'M18 18h2', { c: [14, 6, 2] }, { c: [8, 12, 2] }, { c: [16, 18, 2] }],
  arrowUp: ['M12 19V5', 'm5 12 7-7 7 7'],
  arrowDown: ['M12 5v14', 'm19 12-7 7-7-7'],
  more: [{ c: [5, 12, 1] }, { c: [12, 12, 1] }, { c: [19, 12, 1] }],
};

export default function Icon({ name, size = 20, className = '', ...rest }) {
  const parts = ICONS[name] || [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`icon ${className}`}
      {...rest}
    >
      {parts.map((p, i) =>
        typeof p === 'string' ? <path key={i} d={p} /> : <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} />
      )}
    </svg>
  );
}
