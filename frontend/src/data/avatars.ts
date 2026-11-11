export interface AnimeAvatar {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female' | 'neutral';
  category: 'featured' | 'male' | 'female' | 'specialist';
  url: string;
  tags: string[];
}

export const DEFAULT_AVATAR = '/avatars/anime-matrix-hacker-01.jpg';

export const ANIME_AVATARS: AnimeAvatar[] = [
  // --- FEATURED MASTER AVATARS (User Uploaded High-Res) ---
  {
    id: 'anime-matrix-hacker-01',
    name: 'Neo "RootGirl"',
    role: 'Matrix Infiltrator & Lead Researcher',
    gender: 'female',
    category: 'featured',
    url: '/avatars/anime-matrix-hacker-01.jpg',
    tags: ['Terminal', 'Green Matrix', 'Headphones', 'Glasses', 'Red Team'],
  },
  {
    id: 'anime-cyber-male-01',
    name: 'Kaito "NeonBlade"',
    role: 'Cyberpunk Red Team Operator',
    gender: 'male',
    category: 'featured',
    url: '/avatars/anime-cyber-male-01.jpg',
    tags: ['Neon Cyber', 'Jacket', 'Blue Eyes', 'Offensive Security'],
  },
  {
    id: 'anime-cyber-female-01',
    name: 'Seraph "GhostLine"',
    role: 'Neural Net & Exploit Architect',
    gender: 'female',
    category: 'featured',
    url: '/avatars/anime-cyber-female-01.jpg',
    tags: ['Silver Hair', 'Earrings', 'Data Streams', 'Exploit Dev'],
  },

  // --- MALE CHARACTERS ---
  {
    id: 'anime-ren',
    name: 'Ren "Cipher"',
    role: 'Cryptanalyst & Exploit Dev',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-ren.jpg',
    tags: ['Cyberpunk', 'Cyan Spiky Hair', 'Cyan Eyes', 'Hoodie'],
  },
  {
    id: 'anime-male-03',
    name: 'Kairo "ZeroTrace"',
    role: 'Red Team Infiltrator',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-kairo.jpg',
    tags: ['Cyberpunk', 'Pink Hair', 'Magenta Neon', 'Infiltration'],
  },
  {
    id: 'anime-male-04',
    name: 'Jin "Overclock"',
    role: 'Hardware & Firmware Hacker',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-jin.jpg',
    tags: ['Cyberpunk', 'Green Hair', 'Matrix Code', 'Hardware'],
  },
  {
    id: 'anime-male-05',
    name: 'Sora "Ghost"',
    gender: 'male',
    role: 'Stealth Penetration Tester',
    category: 'male',
    url: '/avatars/anime-sora.jpg',
    tags: ['Cyberpunk', 'White Hair', 'Violet Eyes', 'Stealth'],
  },
  {
    id: 'anime-male-06',
    name: 'Ryu "Bypass"',
    role: 'Auth Bypass Specialist',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-ryu.jpg',
    tags: ['Cyberpunk', 'Crimson Hair', 'Amber Eyes', 'Auth Bypass'],
  },
  {
    id: 'anime-male-07',
    name: 'Daiki "Pulse"',
    role: 'Network Protocol Analyst',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-daiki.jpg',
    tags: ['Cyberpunk', 'Cyan Hair', 'Headphones', 'Network'],
  },
  {
    id: 'anime-male-08',
    name: 'Haruto "Kernel"',
    role: 'Binary & Reverse Engineering',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-haruto.jpg',
    tags: ['Cyberpunk', 'Gold Hair', 'Cyber Visor', 'Reverse Engineering'],
  },
  {
    id: 'anime-male-09',
    name: 'Shin "Spectre"',
    role: 'OSINT & Recon Lead',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-shin.jpg',
    tags: ['Cyberpunk', 'Dark Hair', 'Ice Blue Eyes', 'OSINT'],
  },
  {
    id: 'anime-male-10',
    name: 'Tatsuya "Viper"',
    role: 'Web & API Security Hunter',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-tatsuya.jpg',
    tags: ['Cyberpunk', 'Teal Hair', 'Mint Eyes', 'Web Pentest'],
  },
  {
    id: 'anime-male-11',
    name: 'Kenji "Root"',
    role: 'Cloud & Infrastructure Attacker',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-kenji.jpg',
    tags: ['Cyberpunk', 'Purple Hair', 'Cyber Monocle', 'Cloud Security'],
  },
  {
    id: 'anime-male-12',
    name: 'Yuki "Chronos"',
    role: 'Race Condition & Logic Auditor',
    gender: 'male',
    category: 'male',
    url: '/avatars/anime-yuki.jpg',
    tags: ['Cyberpunk', 'Silver Hair', 'HUD Glasses', 'Business Logic'],
  },

  // --- FEMALE CHARACTERS ---
  {
    id: 'anime-female-02',
    name: 'Akari "NullByte"',
    role: 'Buffer Overflow Researcher',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-02.svg',
    tags: ['Twin Tails', 'Cat Headphones', 'Binary Exploitation'],
  },
  {
    id: 'anime-female-03',
    name: 'Mei "Firewall"',
    role: 'Defense & Incident Response',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-03.svg',
    tags: ['Bob Cut', 'Blue Headset', 'Blue Team'],
  },
  {
    id: 'anime-female-04',
    name: 'Hana "Payload"',
    role: 'XSS & Client-Side Architect',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-04.svg',
    tags: ['Ponytail', 'Magenta Hair', 'XSS'],
  },
  {
    id: 'anime-female-05',
    name: 'Yuna "Glitch"',
    role: 'Fuzzing & Vulnerability Hunter',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-05.svg',
    tags: ['Messy Bun', 'Teal Hair', 'Fuzzing'],
  },
  {
    id: 'anime-female-06',
    name: 'Rin "Matrix"',
    role: 'Shellcode & Payload Engineer',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-06.svg',
    tags: ['Straight Hair', 'Matrix Green', 'Shellcode'],
  },
  {
    id: 'anime-female-07',
    name: 'Aoi "CipherQueen"',
    role: 'Zero-Day Security Specialist',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-07.svg',
    tags: ['Hime Cut', 'Purple Hair', 'Zero-Day'],
  },
  {
    id: 'anime-female-08',
    name: 'Kaede "Echo"',
    role: 'Traffic & Packet Inspection',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-08.svg',
    tags: ['Short Hair', 'Orange Hair', 'Wireshark'],
  },
  {
    id: 'anime-female-09',
    name: 'Sayuri "Eclipse"',
    role: 'Privilege Escalation Master',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-09.svg',
    tags: ['Braids', 'Indigo Hair', 'PrivEsc'],
  },
  {
    id: 'anime-female-10',
    name: 'Mio "Byte"',
    role: 'Web Application Pentester',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-10.svg',
    tags: ['Side Tail', 'Cyan Hair', 'OWASP Top 10'],
  },
  {
    id: 'anime-female-11',
    name: 'Ayumi "Nexus"',
    role: 'AI Model & LLM Red Teamer',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-11.svg',
    tags: ['Twin Buns', 'Pink Hair', 'AI Security'],
  },
  {
    id: 'anime-female-12',
    name: 'Shizuka "Stealth"',
    role: 'Cyber Intelligence Analyst',
    gender: 'female',
    category: 'female',
    url: '/avatars/anime-female-12.svg',
    tags: ['Asymmetric Bob', 'White Hair', 'Intel'],
  },

  // --- SPECIALIZED CYBER OPERATIVES ---
  {
    id: 'anime-cyber-01',
    name: 'Nexus "Kitsune"',
    role: 'Cyber Ninja & Infiltrator',
    gender: 'neutral',
    category: 'specialist',
    url: '/avatars/anime-cyber-01.svg',
    tags: ['Kitsune Mask', 'White Hair', 'Covert Ops'],
  },
  {
    id: 'anime-cyber-02',
    name: 'Vanguard "Sentinel"',
    role: 'Blue Team Lead & SOC Shield',
    gender: 'neutral',
    category: 'specialist',
    url: '/avatars/anime-cyber-02.svg',
    tags: ['Full Visor', 'Blue Armor', 'SOC Defense'],
  },
  {
    id: 'anime-cyber-03',
    name: 'Nyx "DarkWeb"',
    role: 'Threat Intelligence Lead',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/anime-cyber-03.svg',
    tags: ['Deep Purple', 'Hoodie', 'Threat Hunting'],
  },
  {
    id: 'anime-cyber-04',
    name: 'Volt "Overdrive"',
    role: 'Hardware Modder & RFID Hacker',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/anime-cyber-04.svg',
    tags: ['Yellow Spikes', 'Headphones', 'RFID & Hardware'],
  },
  {
    id: 'anime-cyber-05',
    name: 'Jade "Poison"',
    role: 'Malware & Exploit Analyst',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/anime-cyber-05.svg',
    tags: ['Tech Mask', 'Emerald', 'Malware Analysis'],
  },
  {
    id: 'anime-cyber-06',
    name: 'Apex "Operator"',
    role: 'Red Team Strike Commander',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/anime-cyber-06.svg',
    tags: ['Eyepatch', 'Red Accents', 'Command & Control'],
  },
  {
    id: 'anime-cyber-07',
    name: 'Luna "Moonlight"',
    role: 'Cryptography & Hashbreaker',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/anime-cyber-07.svg',
    tags: ['Moonlight Silver', 'Twin Tails', 'Hashcat'],
  },
  {
    id: 'anime-cyber-08',
    name: 'Zen "Logic"',
    role: 'API Architecture & IDOR Specialist',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/anime-cyber-08.svg',
    tags: ['Glasses', 'Teal', 'API Security'],
  },
  {
    id: 'anime-cyber-09',
    name: 'Blaze "Flame"',
    role: 'Web Application Breaker',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/anime-cyber-09.svg',
    tags: ['Cat Headphones', 'Orange Hair', 'Web Exploits'],
  },
  {
    id: 'anime-cyber-10',
    name: 'Echo "Daemon"',
    role: 'Server-Side & SSRF Explorer',
    gender: 'neutral',
    category: 'specialist',
    url: '/avatars/anime-cyber-10.svg',
    tags: ['Undercut', 'Violet Glow', 'SSRF & Cloud'],
  },
  {
    id: 'anime-cyber-11',
    name: 'Zero "Genesis"',
    role: 'Kernel Exploit Architect',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/anime-cyber-11.svg',
    tags: ['Cyber Goggles', 'Sky Blue', 'Kernel Security'],
  },
];

/**
 * Universal safe avatar resolver.
 * Ensures an avatar is NEVER broken or empty anywhere in the application.
 */
export function getAvatarUrl(avatarUrlOrId?: string | null): string {
  if (!avatarUrlOrId || typeof avatarUrlOrId !== 'string') {
    return DEFAULT_AVATAR;
  }

  const clean = avatarUrlOrId.trim();
  if (!clean) return DEFAULT_AVATAR;

  // If it's an avatar identifier (e.g. 'anime-matrix-hacker-01')
  const found = ANIME_AVATARS.find(
    (a) => a.id === clean || a.url === clean || a.url.endsWith(clean)
  );
  if (found) {
    return found.url;
  }

  // If it's a relative URL or absolute HTTP(S) URL
  if (clean.startsWith('/') || clean.startsWith('http://') || clean.startsWith('https://')) {
    // If it's an old legacy unsplash photo, smoothly upgrade it to default anime avatar
    if (clean.includes('unsplash.com')) {
      return DEFAULT_AVATAR;
    }
    return clean;
  }

  return DEFAULT_AVATAR;
}
