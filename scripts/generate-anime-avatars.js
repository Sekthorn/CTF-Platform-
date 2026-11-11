const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'frontend', 'public', 'avatars');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 33 Cyber Anime Character definitions with diverse hairstyles, hair colors, expressions, genders, and gear
const characters = [
  // --- MALE CHARACTERS (1-11) ---
  {
    id: 'anime-male-02',
    name: 'Ren "Cipher"',
    gender: 'male',
    role: 'Cryptanalyst & Exploit Dev',
    bg: ['#0d1117', '#161b22', '#00ffcc'],
    hairColor: '#00e5ff',
    hairShadow: '#0099b8',
    skinColor: '#f7dcd0',
    eyeColor: '#00e5ff',
    hairStyle: 'spiky',
    accessory: 'hud-monocle',
    jacketColor: '#121820',
    accentColor: '#00ffcc',
    expression: 'confident'
  },
  {
    id: 'anime-male-03',
    name: 'Kaito "ZeroTrace"',
    gender: 'male',
    role: 'Red Team Infiltrator',
    bg: ['#0f051d', '#1a0933', '#ff007f'],
    hairColor: '#ff007f',
    hairShadow: '#aa0055',
    skinColor: '#fce2d6',
    eyeColor: '#ff2a8d',
    hairStyle: 'slicked-undercut',
    accessory: 'cyber-earpiece',
    jacketColor: '#140c24',
    accentColor: '#ff007f',
    expression: 'smirk'
  },
  {
    id: 'anime-male-04',
    name: 'Jin "Overclock"',
    gender: 'male',
    role: 'Hardware & Firmware Hacker',
    bg: ['#051515', '#0a2624', '#00ff66'],
    hairColor: '#39ff14',
    hairShadow: '#1e8e0b',
    skinColor: '#eed5c2',
    eyeColor: '#39ff14',
    hairStyle: 'messy-bangs',
    accessory: 'matrix-glasses',
    jacketColor: '#0a1a14',
    accentColor: '#39ff14',
    expression: 'focused'
  },
  {
    id: 'anime-male-05',
    name: 'Sora "Ghost"',
    gender: 'male',
    role: 'Stealth Penetration Tester',
    bg: ['#0e1017', '#181b26', '#7000ff'],
    hairColor: '#e2e8f0',
    hairShadow: '#94a3b8',
    skinColor: '#fbe3d9',
    eyeColor: '#8b5cf6',
    hairStyle: 'parted-sleek',
    accessory: 'hoodie',
    jacketColor: '#0f172a',
    accentColor: '#8b5cf6',
    expression: 'mysterious'
  },
  {
    id: 'anime-male-06',
    name: 'Ryu "Bypass"',
    gender: 'male',
    role: 'Authentication Bypass Specialist',
    bg: ['#170b0b', '#2a1111', '#ff3b30'],
    hairColor: '#ff3b30',
    hairShadow: '#991b1b',
    skinColor: '#fad4c0',
    eyeColor: '#ff453a',
    hairStyle: 'spiky-rebel',
    accessory: 'tech-mask',
    jacketColor: '#1a0f0f',
    accentColor: '#ff3b30',
    expression: 'fierce'
  },
  {
    id: 'anime-male-07',
    name: 'Daiki "Pulse"',
    gender: 'male',
    role: 'Network Protocol Analyst',
    bg: ['#08101e', '#0f2038', '#00a8ff'],
    hairColor: '#38bdf8',
    hairShadow: '#0284c7',
    skinColor: '#f5d5c5',
    eyeColor: '#38bdf8',
    hairStyle: 'messy-curls',
    accessory: 'headphones',
    jacketColor: '#0b192c',
    accentColor: '#00a8ff',
    expression: 'calm'
  },
  {
    id: 'anime-male-08',
    name: 'Haruto "Kernel"',
    gender: 'male',
    role: 'Binary & Reverse Engineering',
    bg: ['#121212', '#1e1e1e', '#ffd600'],
    hairColor: '#facc15',
    hairShadow: '#ca8a04',
    skinColor: '#f8dcd0',
    eyeColor: '#facc15',
    hairStyle: 'undercut-fade',
    accessory: 'cyber-goggles',
    jacketColor: '#18181b',
    accentColor: '#eab308',
    expression: 'curious'
  },
  {
    id: 'anime-male-09',
    name: 'Shin "Spectre"',
    gender: 'male',
    role: 'OSINT & Recon Lead',
    bg: ['#0d141e', '#132337', '#38bdf8'],
    hairColor: '#1e293b',
    hairShadow: '#0f172a',
    skinColor: '#edd3c3',
    eyeColor: '#0ea5e9',
    hairStyle: 'straight-bangs',
    accessory: 'cyber-collar',
    jacketColor: '#0f172a',
    accentColor: '#38bdf8',
    expression: 'stoic'
  },
  {
    id: 'anime-male-10',
    name: 'Tatsuya "Viper"',
    gender: 'male',
    role: 'Web & API Security Hunter',
    bg: ['#071a10', '#0e2e1e', '#10b981'],
    hairColor: '#10b981',
    hairShadow: '#047857',
    skinColor: '#fce1d2',
    eyeColor: '#10b981',
    hairStyle: 'spiky-short',
    accessory: 'neon-earring',
    jacketColor: '#062016',
    accentColor: '#10b981',
    expression: 'sharp'
  },
  {
    id: 'anime-male-11',
    name: 'Kenji "Root"',
    gender: 'male',
    role: 'Cloud & Infrastructure Attacker',
    bg: ['#160824', '#2a1145', '#d946ef'],
    hairColor: '#c084fc',
    hairShadow: '#7e22ce',
    skinColor: '#fbe2d7',
    eyeColor: '#c084fc',
    hairStyle: 'wild-locks',
    accessory: 'cyber-implant',
    jacketColor: '#1e1133',
    accentColor: '#d946ef',
    expression: 'confident'
  },
  {
    id: 'anime-male-12',
    name: 'Yuki "Chronos"',
    gender: 'male',
    role: 'Race Condition & Logic Auditor',
    bg: ['#141923', '#20293a', '#94a3b8'],
    hairColor: '#94a3b8',
    hairShadow: '#475569',
    skinColor: '#f7dad0',
    eyeColor: '#38bdf8',
    hairStyle: 'side-swept',
    accessory: 'hud-glasses',
    jacketColor: '#1e293b',
    accentColor: '#38bdf8',
    expression: 'calm'
  },

  // --- FEMALE CHARACTERS (12-22) ---
  {
    id: 'anime-female-02',
    name: 'Akari "NullByte"',
    gender: 'female',
    role: 'Buffer Overflow Researcher',
    bg: ['#18081c', '#2c1033', '#f43f5e'],
    hairColor: '#f43f5e',
    hairShadow: '#be123c',
    skinColor: '#fee2e2',
    eyeColor: '#fb7185',
    hairStyle: 'twin-tails',
    accessory: 'cat-headphones',
    jacketColor: '#1f1325',
    accentColor: '#f43f5e',
    expression: 'cheerful'
  },
  {
    id: 'anime-female-03',
    name: 'Mei "Firewall"',
    gender: 'female',
    role: 'Defense & Incident Response',
    bg: ['#071321', '#0e243d', '#38bdf8'],
    hairColor: '#0284c7',
    hairShadow: '#0369a1',
    skinColor: '#fef2f2',
    eyeColor: '#38bdf8',
    hairStyle: 'bob-cut',
    accessory: 'cyber-headset',
    jacketColor: '#0c1c2e',
    accentColor: '#38bdf8',
    expression: 'focused'
  },
  {
    id: 'anime-female-04',
    name: 'Hana "Payload"',
    gender: 'female',
    role: 'XSS & Client-Side Architect',
    bg: ['#1c0c24', '#321642', '#e879f9'],
    hairColor: '#d946ef',
    hairShadow: '#a21caf',
    skinColor: '#fce7f3',
    eyeColor: '#e879f9',
    hairStyle: 'ponytail',
    accessory: 'neon-earclips',
    jacketColor: '#22112e',
    accentColor: '#d946ef',
    expression: 'smirk'
  },
  {
    id: 'anime-female-05',
    name: 'Yuna "Glitch"',
    gender: 'female',
    role: 'Fuzzing & Vulnerability Hunter',
    bg: ['#071815', '#0f312a', '#2dd4bf'],
    hairColor: '#14b8a6',
    hairShadow: '#0f766e',
    skinColor: '#f0fdf4',
    eyeColor: '#2dd4bf',
    hairStyle: 'messy-bun',
    accessory: 'cyber-goggles-up',
    jacketColor: '#0a221d',
    accentColor: '#2dd4bf',
    expression: 'playful'
  },
  {
    id: 'anime-female-06',
    name: 'Rin "Matrix"',
    gender: 'female',
    role: 'Shellcode & Payload Engineer',
    bg: ['#05150a', '#0b2614', '#22c55e'],
    hairColor: '#22c55e',
    hairShadow: '#15803d',
    skinColor: '#f7fee7',
    eyeColor: '#4ade80',
    hairStyle: 'straight-long',
    accessory: 'matrix-headband',
    jacketColor: '#081f10',
    accentColor: '#22c55e',
    expression: 'cool'
  },
  {
    id: 'anime-female-07',
    name: 'Aoi "CipherQueen"',
    gender: 'female',
    role: 'Zero-Day Security Specialist',
    bg: ['#0f0f18', '#1c1c2e', '#a855f7'],
    hairColor: '#c084fc',
    hairShadow: '#9333ea',
    skinColor: '#fdf4ff',
    eyeColor: '#a855f7',
    hairStyle: 'hime-cut',
    accessory: 'hud-hairpins',
    jacketColor: '#161624',
    accentColor: '#a855f7',
    expression: 'elegant'
  },
  {
    id: 'anime-female-08',
    name: 'Kaede "Echo"',
    gender: 'female',
    role: 'Traffic & Packet Inspection',
    bg: ['#1c1008', '#331e0f', '#fb923c'],
    hairColor: '#f97316',
    hairShadow: '#c2410c',
    skinColor: '#fff7ed',
    eyeColor: '#fb923c',
    hairStyle: 'short-spiky',
    accessory: 'gaming-headset',
    jacketColor: '#24140b',
    accentColor: '#f97316',
    expression: 'energetic'
  },
  {
    id: 'anime-female-09',
    name: 'Sayuri "Eclipse"',
    gender: 'female',
    role: 'Privilege Escalation Master',
    bg: ['#121118', '#211f2d', '#818cf8'],
    hairColor: '#312e81',
    hairShadow: '#1e1b4b',
    skinColor: '#e0e7ff',
    eyeColor: '#818cf8',
    hairStyle: 'braided-side',
    accessory: 'cyber-mask-half',
    jacketColor: '#161520',
    accentColor: '#818cf8',
    expression: 'calm'
  },
  {
    id: 'anime-female-10',
    name: 'Mio "Byte"',
    gender: 'female',
    role: 'Web Application Pentester',
    bg: ['#06171f', '#0d2b3b', '#06b6d4'],
    hairColor: '#06b6d4',
    hairShadow: '#0891b2',
    skinColor: '#ecfeff',
    eyeColor: '#22d3ee',
    hairStyle: 'side-tail',
    accessory: 'choker-led',
    jacketColor: '#0a202c',
    accentColor: '#06b6d4',
    expression: 'curious'
  },
  {
    id: 'anime-female-11',
    name: 'Ayumi "Nexus"',
    gender: 'female',
    role: 'AI Model & LLM Red Teamer',
    bg: ['#16061c', '#2c0e38', '#ec4899'],
    hairColor: '#f472b6',
    hairShadow: '#db2777',
    skinColor: '#fdf2f8',
    eyeColor: '#f472b6',
    hairStyle: 'twin-buns',
    accessory: 'ar-glasses',
    jacketColor: '#1f0d26',
    accentColor: '#ec4899',
    expression: 'sharp'
  },
  {
    id: 'anime-female-12',
    name: 'Shizuka "Stealth"',
    gender: 'female',
    role: 'Cyber Intelligence Analyst',
    bg: ['#141416', '#222227', '#e2e8f0'],
    hairColor: '#f8fafc',
    hairShadow: '#cbd5e1',
    skinColor: '#f8fafc',
    eyeColor: '#06b6d4',
    hairStyle: 'asymmetric-bob',
    accessory: 'cyber-collar',
    jacketColor: '#18181b',
    accentColor: '#38bdf8',
    expression: 'mysterious'
  },

  // --- SPECIALIZED CYBER OPERATIVES (23-33) ---
  {
    id: 'anime-cyber-01',
    name: 'Nexus "Kitsune"',
    gender: 'neutral',
    role: 'Cyber Ninja & Infiltrator',
    bg: ['#170514', '#2d0a27', '#ff0055'],
    hairColor: '#ffffff',
    hairShadow: '#e2e8f0',
    skinColor: '#fff1f2',
    eyeColor: '#ff0055',
    hairStyle: 'fox-ears-hair',
    accessory: 'kitsune-cyber-mask',
    jacketColor: '#1c0c1b',
    accentColor: '#ff0055',
    expression: 'smirk'
  },
  {
    id: 'anime-cyber-02',
    name: 'Vanguard "Sentinel"',
    gender: 'neutral',
    role: 'Blue Team Lead & SOC Shield',
    bg: ['#04111f', '#09223e', '#3b82f6'],
    hairColor: '#60a5fa',
    hairShadow: '#2563eb',
    skinColor: '#eff6ff',
    eyeColor: '#60a5fa',
    hairStyle: 'spiky',
    accessory: 'full-visor',
    jacketColor: '#081a30',
    accentColor: '#3b82f6',
    expression: 'focused'
  },
  {
    id: 'anime-cyber-03',
    name: 'Nyx "DarkWeb"',
    gender: 'female',
    role: 'Threat Intelligence Lead',
    bg: ['#0f0717', '#1f0f2f', '#a21caf'],
    hairColor: '#701a75',
    hairShadow: '#4a044e',
    skinColor: '#fae8ff',
    eyeColor: '#d946ef',
    hairStyle: 'straight-long',
    accessory: 'hoodie',
    jacketColor: '#170c24',
    accentColor: '#c084fc',
    expression: 'mysterious'
  },
  {
    id: 'anime-cyber-04',
    name: 'Volt "Overdrive"',
    gender: 'male',
    role: 'Hardware Modder & RFID Hacker',
    bg: ['#191404', '#332909', '#eab308'],
    hairColor: '#facc15',
    hairShadow: '#a16207',
    skinColor: '#fefce8',
    eyeColor: '#facc15',
    hairStyle: 'spiky-rebel',
    accessory: 'headphones',
    jacketColor: '#241d06',
    accentColor: '#eab308',
    expression: 'energetic'
  },
  {
    id: 'anime-cyber-05',
    name: 'Jade "Poison"',
    gender: 'female',
    role: 'Malware & Exploit Analyst',
    bg: ['#041a12', '#093625', '#10b981'],
    hairColor: '#34d399',
    hairShadow: '#059669',
    skinColor: '#ecfdf5',
    eyeColor: '#10b981',
    hairStyle: 'messy-bun',
    accessory: 'tech-mask',
    jacketColor: '#072419',
    accentColor: '#10b981',
    expression: 'sharp'
  },
  {
    id: 'anime-cyber-06',
    name: 'Apex "Operator"',
    gender: 'male',
    role: 'Red Team Strike Commander',
    bg: ['#170606', '#2d0e0e', '#ef4444'],
    hairColor: '#1c1917',
    hairShadow: '#0c0a09',
    skinColor: '#fee2e2',
    eyeColor: '#ef4444',
    hairStyle: 'slicked-undercut',
    accessory: 'cyber-eyepatch',
    jacketColor: '#1c0f0f',
    accentColor: '#ef4444',
    expression: 'fierce'
  },
  {
    id: 'anime-cyber-07',
    name: 'Luna "Moonlight"',
    gender: 'female',
    role: 'Cryptography & Hashbreaker',
    bg: ['#0d0d1e', '#19193b', '#818cf8'],
    hairColor: '#e0e7ff',
    hairShadow: '#a5b4fc',
    skinColor: '#f5f3ff',
    eyeColor: '#6366f1',
    hairStyle: 'twin-tails',
    accessory: 'cyber-hairpins',
    jacketColor: '#14142d',
    accentColor: '#818cf8',
    expression: 'calm'
  },
  {
    id: 'anime-cyber-08',
    name: 'Zen "Logic"',
    gender: 'male',
    role: 'API Architecture & IDOR Specialist',
    bg: ['#081717', '#112e2e', '#14b8a6'],
    hairColor: '#2dd4bf',
    hairShadow: '#0f766e',
    skinColor: '#f0fdfa',
    eyeColor: '#14b8a6',
    hairStyle: 'parted-sleek',
    accessory: 'glasses',
    jacketColor: '#0c2222',
    accentColor: '#14b8a6',
    expression: 'focused'
  },
  {
    id: 'anime-cyber-09',
    name: 'Blaze "Flame"',
    gender: 'female',
    role: 'Web Application Breaker',
    bg: ['#1c0c07', '#38170d', '#f97316'],
    hairColor: '#fb923c',
    hairShadow: '#ea580c',
    skinColor: '#fff7ed',
    eyeColor: '#f97316',
    hairStyle: 'bob-cut',
    accessory: 'cat-headphones',
    jacketColor: '#26120a',
    accentColor: '#f97316',
    expression: 'playful'
  },
  {
    id: 'anime-cyber-10',
    name: 'Echo "Daemon"',
    gender: 'neutral',
    role: 'Server-Side & SSRF Explorer',
    bg: ['#130a21', '#24143e', '#a855f7'],
    hairColor: '#a855f7',
    hairShadow: '#7e22ce',
    skinColor: '#faf5ff',
    eyeColor: '#c084fc',
    hairStyle: 'undercut-fade',
    accessory: 'cyber-collar',
    jacketColor: '#1a102b',
    accentColor: '#a855f7',
    expression: 'confident'
  },
  {
    id: 'anime-cyber-11',
    name: 'Zero "Genesis"',
    gender: 'male',
    role: 'Kernel Exploit Architect',
    bg: ['#09141f', '#12263b', '#0ea5e9'],
    hairColor: '#38bdf8',
    hairShadow: '#0284c7',
    skinColor: '#f0f9ff',
    eyeColor: '#38bdf8',
    hairStyle: 'messy-bangs',
    accessory: 'cyber-goggles',
    jacketColor: '#0e1e30',
    accentColor: '#38bdf8',
    expression: 'cool'
  }
];

function generateSvgAvatar(c) {
  // Generate consistent anime face vector
  const isFemale = c.gender === 'female';
  const hasHeadphones = c.accessory === 'headphones' || c.accessory === 'cat-headphones' || c.accessory === 'gaming-headset';
  const hasVisor = c.accessory === 'full-visor' || c.accessory === 'hud-monocle' || c.accessory === 'cyber-goggles';
  const hasMask = c.accessory === 'tech-mask' || c.accessory === 'cyber-mask-half';
  const hasGlasses = c.accessory === 'matrix-glasses' || c.accessory === 'ar-glasses' || c.accessory === 'glasses' || c.accessory === 'hud-glasses';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <radialGradient id="bg-${c.id}" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${c.bg[1]}" />
      <stop offset="80%" stop-color="${c.bg[0]}" />
      <stop offset="100%" stop-color="#05070a" />
    </radialGradient>
    <linearGradient id="neon-${c.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.accentColor}" />
      <stop offset="100%" stop-color="${c.hairColor}" />
    </linearGradient>
    <filter id="glow-${c.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <clipPath id="circleClip-${c.id}">
      <circle cx="128" cy="128" r="124" />
    </clipPath>
  </defs>

  <g clip-path="url(#circleClip-${c.id})">
    <!-- Background Canvas -->
    <rect width="256" height="256" fill="url(#bg-${c.id})" />

    <!-- Cyber Matrix Grid / Circuit Accent in Background -->
    <g stroke="${c.accentColor}" stroke-opacity="0.12" stroke-width="1.2" fill="none">
      <path d="M 0 64 H 256 M 0 128 H 256 M 0 192 H 256" />
      <path d="M 64 0 V 256 M 128 0 V 256 M 192 0 V 256" />
      <circle cx="128" cy="128" r="95" stroke-dasharray="4 6" />
      <circle cx="128" cy="128" r="115" stroke-dasharray="2 8" />
    </g>

    <!-- Ambient Neon Aura Glow Behind Head -->
    <circle cx="128" cy="115" r="70" fill="${c.accentColor}" opacity="0.16" filter="url(#glow-${c.id})" />

    <!-- Back Hair (if long or twin tails) -->
    ${c.hairStyle === 'twin-tails' ? `
      <path d="M 60 90 Q 20 130 35 190 Q 50 170 65 140 Z" fill="${c.hairShadow}" />
      <path d="M 196 90 Q 236 130 221 190 Q 206 170 191 140 Z" fill="${c.hairShadow}" />
      <path d="M 65 85 Q 25 125 40 185 Q 55 165 70 135 Z" fill="${c.hairColor}" />
      <path d="M 191 85 Q 231 125 216 185 Q 201 165 186 135 Z" fill="${c.hairColor}" />
      <!-- Glowing hair clips -->
      <rect x="58" y="92" width="12" height="6" rx="2" fill="${c.accentColor}" filter="url(#glow-${c.id})" />
      <rect x="186" y="92" width="12" height="6" rx="2" fill="${c.accentColor}" filter="url(#glow-${c.id})" />
    ` : ''}

    ${c.hairStyle === 'straight-long' || c.hairStyle === 'hime-cut' ? `
      <path d="M 65 110 Q 55 170 70 215 L 186 215 Q 201 170 191 110 Z" fill="${c.hairShadow}" />
    ` : ''}

    <!-- Cyber Jacket / Shoulders & Torso -->
    <g>
      <!-- Base Shoulders -->
      <path d="M 40 256 Q 70 195 128 195 Q 186 195 216 256 Z" fill="${c.jacketColor}" />
      <!-- Collar -->
      <path d="M 95 195 L 110 160 L 146 160 L 161 195 L 128 215 Z" fill="${c.jacketColor}" stroke="${c.accentColor}" stroke-opacity="0.4" stroke-width="1.5" />
      <!-- Neon Trim Lines on Jacket -->
      <path d="M 60 256 L 85 205 L 105 215" stroke="${c.accentColor}" stroke-width="2" fill="none" opacity="0.8" filter="url(#glow-${c.id})" />
      <path d="M 196 256 L 171 205 L 151 215" stroke="${c.accentColor}" stroke-width="2" fill="none" opacity="0.8" filter="url(#glow-${c.id})" />
      <!-- Central Cyber Zipper / Power Node -->
      <line x1="128" y1="205" x2="128" y2="256" stroke="${c.accentColor}" stroke-width="2.5" />
      <circle cx="128" cy="208" r="3" fill="#ffffff" filter="url(#glow-${c.id})" />
    </g>

    <!-- Neck -->
    <path d="M 112 150 L 112 185 Q 128 192 144 185 L 144 150 Z" fill="${c.skinColor}" opacity="0.95" />
    <path d="M 112 150 L 112 165 Q 128 175 144 165 L 144 150 Z" fill="#000000" opacity="0.12" />

    ${c.accessory === 'cyber-collar' || c.accessory === 'choker-led' ? `
      <!-- Glowing Tech Choker / Collar -->
      <rect x="110" y="166" width="36" height="7" rx="3" fill="#111827" stroke="${c.accentColor}" stroke-width="1.5" />
      <circle cx="128" cy="169.5" r="2.5" fill="${c.accentColor}" filter="url(#glow-${c.id})" />
    ` : ''}

    <!-- Face Contour (Clean Anime Jawline) -->
    <path d="M 74 105 Q 74 155 128 178 Q 182 155 182 105 Q 182 65 128 65 Q 74 65 74 105 Z" fill="${c.skinColor}" />

    <!-- Cute Anime Blush Marks -->
    <ellipse cx="92" cy="138" rx="8" ry="3.5" fill="#f43f5e" opacity="0.18" />
    <ellipse cx="164" cy="138" rx="8" ry="3.5" fill="#f43f5e" opacity="0.18" />

    <!-- Expressive Anime Eyes -->
    <g>
      <!-- Left Eye -->
      <ellipse cx="102" cy="122" rx="12" ry="15" fill="#ffffff" />
      <ellipse cx="102" cy="123" rx="8.5" ry="12" fill="${c.eyeColor}" />
      <ellipse cx="102" cy="123" rx="5" ry="7" fill="#0f172a" />
      <!-- Eye Highlights -->
      <circle cx="99" cy="117" r="3" fill="#ffffff" />
      <circle cx="105" cy="127" r="1.5" fill="#ffffff" />
      <!-- Eyelashes & Brow -->
      <path d="M 88 114 Q 102 107 116 113" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M 89 104 Q 103 98 115 103" stroke="${c.hairShadow}" stroke-width="2.2" fill="none" stroke-linecap="round" />

      <!-- Right Eye -->
      <ellipse cx="154" cy="122" rx="12" ry="15" fill="#ffffff" />
      <ellipse cx="154" cy="123" rx="8.5" ry="12" fill="${c.eyeColor}" />
      <ellipse cx="154" cy="123" rx="5" ry="7" fill="#0f172a" />
      <!-- Eye Highlights -->
      <circle cx="151" cy="117" r="3" fill="#ffffff" />
      <circle cx="157" cy="127" r="1.5" fill="#ffffff" />
      <!-- Eyelashes & Brow -->
      <path d="M 140 113 Q 154 107 168 114" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M 141 103 Q 153 98 167 104" stroke="${c.hairShadow}" stroke-width="2.2" fill="none" stroke-linecap="round" />
    </g>

    <!-- Stylized Anime Nose -->
    <circle cx="128" cy="136" r="1.2" fill="#d97706" opacity="0.6" />

    <!-- Anime Mouth with Expression -->
    ${c.expression === 'smirk' ? `
      <path d="M 124 153 Q 133 156 138 150" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
    ` : c.expression === 'playful' || c.expression === 'cheerful' ? `
      <path d="M 121 151 Q 128 158 135 151 Z" fill="#f43f5e" opacity="0.8" stroke="#0f172a" stroke-width="1.5" />
    ` : `
      <path d="M 122 152 Q 128 154 134 152" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
    `}

    <!-- Optional Tech Mask / Cybernetic Gear -->
    ${hasMask ? `
      <!-- Tactical Carbon Filter Mask -->
      <path d="M 104 140 L 128 150 L 152 140 L 148 174 L 128 180 L 108 174 Z" fill="#0f172a" stroke="${c.accentColor}" stroke-width="1.8" />
      <circle cx="128" cy="162" r="5" fill="${c.accentColor}" filter="url(#glow-${c.id})" />
      <line x1="114" y1="158" x2="120" y2="158" stroke="${c.accentColor}" stroke-width="1.5" />
      <line x1="136" y1="158" x2="142" y2="158" stroke="${c.accentColor}" stroke-width="1.5" />
    ` : ''}

    ${hasGlasses ? `
      <!-- Cyber HUD Glasses / Visor -->
      <rect x="88" y="112" width="30" height="18" rx="4" fill="${c.accentColor}" fill-opacity="0.3" stroke="${c.accentColor}" stroke-width="2" />
      <rect x="138" y="112" width="30" height="18" rx="4" fill="${c.accentColor}" fill-opacity="0.3" stroke="${c.accentColor}" stroke-width="2" />
      <line x1="118" y1="120" x2="138" y2="120" stroke="${c.accentColor}" stroke-width="2" />
      <circle cx="95" cy="118" r="2" fill="#ffffff" filter="url(#glow-${c.id})" />
    ` : ''}

    ${hasVisor ? `
      <!-- Full Cyber HUD Visor -->
      <path d="M 82 110 Q 128 100 174 110 L 170 132 Q 128 122 86 132 Z" fill="#020617" fill-opacity="0.85" stroke="${c.accentColor}" stroke-width="2" />
      <line x1="92" y1="121" x2="164" y2="121" stroke="${c.accentColor}" stroke-width="1.5" stroke-dasharray="6 3" filter="url(#glow-${c.id})" />
    ` : ''}

    <!-- Anime Hair (Front Strands, Bangs, Highlights) -->
    <g>
      <!-- Main Hair Mass -->
      <path d="M 68 100 Q 64 50 128 45 Q 192 50 188 100 Q 180 82 168 76 Q 128 72 88 76 Q 76 82 68 100 Z" fill="${c.hairShadow}" />

      <!-- Bangs / Front Locks -->
      <path d="M 72 90 Q 86 115 95 125 Q 92 105 104 85 Q 115 118 124 130 Q 126 102 136 82 Q 148 116 158 126 Q 158 100 172 88 Q 186 110 186 125 Q 192 85 180 65 Q 128 50 76 65 Z" fill="${c.hairColor}" />

      <!-- Spikes / Hair Strands Details -->
      <path d="M 98 52 Q 112 30 132 46 Q 146 26 160 50" fill="${c.hairColor}" />
      <path d="M 72 70 Q 56 46 80 52" fill="${c.hairColor}" />
      <path d="M 184 70 Q 200 46 176 52" fill="${c.hairColor}" />

      <!-- Glowing Neon Hair Highlight Streak -->
      <path d="M 88 66 Q 128 58 168 66" stroke="${c.accentColor}" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round" filter="url(#glow-${c.id})" />
    </g>

    <!-- Headphones / Cyber Gear on Top -->
    ${hasHeadphones ? `
      <!-- Headphone Arch -->
      <path d="M 66 105 A 70 70 0 0 1 190 105" stroke="#0f172a" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M 70 102 A 66 66 0 0 1 186 102" stroke="${c.accentColor}" stroke-width="2" fill="none" opacity="0.8" filter="url(#glow-${c.id})" />

      ${c.accessory === 'cat-headphones' ? `
        <!-- Cat Ear Accents -->
        <polygon points="82,54 64,22 100,38" fill="#0f172a" stroke="${c.accentColor}" stroke-width="2" />
        <polygon points="80,50 68,28 94,40" fill="${c.accentColor}" opacity="0.8" filter="url(#glow-${c.id})" />
        <polygon points="174,54 192,22 156,38" fill="#0f172a" stroke="${c.accentColor}" stroke-width="2" />
        <polygon points="176,50 188,28 162,40" fill="${c.accentColor}" opacity="0.8" filter="url(#glow-${c.id})" />
      ` : ''}

      <!-- Ear Cups -->
      <rect x="52" y="100" width="16" height="34" rx="8" fill="#0f172a" stroke="${c.accentColor}" stroke-width="2" />
      <circle cx="60" cy="117" r="4" fill="${c.accentColor}" filter="url(#glow-${c.id})" />
      <rect x="188" y="100" width="16" height="34" rx="8" fill="#0f172a" stroke="${c.accentColor}" stroke-width="2" />
      <circle cx="196" cy="117" r="4" fill="${c.accentColor}" filter="url(#glow-${c.id})" />
    ` : ''}

    <!-- Circular High-Tech Avatar Border Frame -->
    <circle cx="128" cy="128" r="122" stroke="url(#neon-${c.id})" stroke-width="3" fill="none" filter="url(#glow-${c.id})" />
    <circle cx="128" cy="128" r="126" stroke="#000000" stroke-width="2" fill="none" opacity="0.7" />

    <!-- Role Tech Watermark Badge -->
    <rect x="76" y="234" width="104" height="16" rx="4" fill="#030712" fill-opacity="0.9" stroke="${c.accentColor}" stroke-width="1" />
    <text x="128" y="245" fill="${c.accentColor}" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle" letter-spacing="1">
      ${c.role.split(' ')[0].toUpperCase()} // CTF
    </text>
  </g>
</svg>`;
}

// Generate all 33 SVG avatars
let count = 0;
for (const char of characters) {
  const svg = generateSvgAvatar(char);
  const filePath = path.join(targetDir, `${char.id}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
  count++;
}

console.log(`Successfully generated ${count} unique anime SVG avatars in ${targetDir}`);
