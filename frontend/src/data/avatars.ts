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
    id: 'avatar-m01-ren',
    name: 'Ren "Blackline"',
    role: 'Infrastructure Exploit Operator',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m01-ren.webp',
    tags: ['Undercut', 'Amber Eyes', 'Earpiece', 'Cyan', 'Stoic'],
  },
  {
    id: 'avatar-m02-kairo',
    name: 'Kairo "Patchwork"',
    role: 'Bug Bounty Hunter',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m02-kairo.webp',
    tags: ['Curly Hair', 'Freckles', 'Headphones', 'Orange', 'Friendly'],
  },
  {
    id: 'avatar-m03-jin',
    name: 'Jin "Ironwall"',
    role: 'Physical Security Breacher',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m03-jin.webp',
    tags: ['Buzzcut', 'Silver Hair', 'Scar', 'Red', 'Confident'],
  },
  {
    id: 'avatar-m04-sora',
    name: 'Sora "Lullaby"',
    role: 'Secure Code Reviewer',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m04-sora.webp',
    tags: ['Ponytail', 'White Hair', 'Glasses', 'Lavender', 'Calm'],
  },
  {
    id: 'avatar-m05-daiki',
    name: 'Daiki "Riot"',
    role: 'Hardware Hacker',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m05-daiki.webp',
    tags: ['Mohawk', 'Green Hair', 'Cyber Jaw', 'Lime', 'Punk'],
  },
  {
    id: 'avatar-m06-haruto',
    name: 'Haruto "Veil"',
    role: 'OSINT Specialist',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m06-haruto.webp',
    tags: ['Long Bangs', 'Blue Hair', 'Mysterious', 'Electric Blue'],
  },
  {
    id: 'avatar-m07-shin',
    name: 'Shin "Redshift"',
    role: 'Exploit Chain Developer',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m07-shin.webp',
    tags: ['Cyber Eye', 'Black Hair', 'Trench Coat', 'Crimson', 'Serious'],
  },
  {
    id: 'avatar-m08-tatsuya',
    name: 'Tatsuya "Sunbyte"',
    role: 'DevSecOps Engineer',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m08-tatsuya.webp',
    tags: ['Blond', 'Glasses', 'Dimples', 'Gold', 'Friendly'],
  },
  {
    id: 'avatar-m09-kenji',
    name: 'Kenji "Oldguard"',
    role: 'Veteran Incident Responder',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m09-kenji.webp',
    tags: ['Man Bun', 'Stubble', 'VR Visor', 'Teal', 'Wise'],
  },
  {
    id: 'avatar-m10-ryu',
    name: 'Ryu "Pulse"',
    role: 'Wireless Attack Specialist',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m10-ryu.webp',
    tags: ['Locs', 'Gold Earrings', 'Bomber Jacket', 'Magenta', 'Confident'],
  },
  {
    id: 'avatar-m11-yuto',
    name: 'Yuto "Kitten"',
    role: 'CTF Speedrunner',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m11-yuto.webp',
    tags: ['Cat Headphones', 'Purple Hair', 'Fang', 'Purple', 'Mischievous'],
  },
  {
    id: 'avatar-m12-akio',
    name: 'Akio "Frost"',
    role: 'Kernel Exploit Researcher',
    gender: 'male',
    category: 'male',
    url: '/avatars/male/m12-akio.webp',
    tags: ['Platinum Hair', 'Circuit Tattoo', 'Ice Eyes', 'Ice Blue', 'Cold'],
  },

  // --- FEMALE CHARACTERS ---
  {
    id: 'avatar-f01-akari',
    name: 'Akari "Crimson"',
    role: 'Web Application Auditor',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f01-akari.webp',
    tags: ['Hime Cut', 'Black Hair', 'Choker', 'Red', 'Elegant'],
  },
  {
    id: 'avatar-f02-mei',
    name: 'Mei "Sparkle"',
    role: 'XSS Hunter',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f02-mei.webp',
    tags: ['Pink Bob', 'Star Clips', 'Green Eyes', 'Pink', 'Cheerful'],
  },
  {
    id: 'avatar-f03-hana',
    name: 'Hana "Tidal"',
    role: 'API Security Tester',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f03-hana.webp',
    tags: ['Curly Hair', 'Hoop Earrings', 'Teal', 'Confident'],
  },
  {
    id: 'avatar-f04-yuna',
    name: 'Yuna "Razor"',
    role: 'Tactical Intrusion Operator',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f04-yuna.webp',
    tags: ['Side Shave', 'Silver Hair', 'Ear Cuffs', 'Cyan', 'Serious'],
  },
  {
    id: 'avatar-f05-rin',
    name: 'Rin "Drowsy"',
    role: 'Fuzzing Specialist',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f05-rin.webp',
    tags: ['Twin Buns', 'Blue Hair', 'Lollipop', 'Headphones', 'Sky Blue'],
  },
  {
    id: 'avatar-f06-aoi',
    name: 'Aoi "Skylark"',
    role: 'Drone & IoT Hacker',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f06-aoi.webp',
    tags: ['Auburn Hair', 'Goggles', 'Freckles', 'Amber', 'Friendly'],
  },
  {
    id: 'avatar-f07-kaede',
    name: 'Kaede "Wraith"',
    role: 'Covert Channel Analyst',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f07-kaede.webp',
    tags: ['White Hair', 'Monocle', 'Hood', 'Violet', 'Mysterious'],
  },
  {
    id: 'avatar-f08-sayuri',
    name: 'Sayuri "Ledger"',
    role: 'Security Compliance Lead',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f08-sayuri.webp',
    tags: ['Pixie Cut', 'Glasses', 'Blazer', 'Emerald', 'Professional'],
  },
  {
    id: 'avatar-f09-mio',
    name: 'Mio "Lynx"',
    role: 'Social Engineering Expert',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f09-mio.webp',
    tags: ['Ponytail', 'Blonde', 'Cat Eyes', 'Visor', 'Yellow'],
  },
  {
    id: 'avatar-f10-ayumi',
    name: 'Ayumi "Static"',
    role: 'Exploit Broker',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f10-ayumi.webp',
    tags: ['Wolf Cut', 'Purple Hair', 'Nose Stud', 'Leather', 'Punk'],
  },
  {
    id: 'avatar-f11-shizuka',
    name: 'Shizuka "Quill"',
    role: 'Threat Intelligence Writer',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f11-shizuka.webp',
    tags: ['Braid', 'Mint Hair', 'Glasses', 'Mint', 'Gentle'],
  },
  {
    id: 'avatar-f12-nova',
    name: 'Nova "Blaze"',
    role: 'Offensive Hardware Operator',
    gender: 'female',
    category: 'female',
    url: '/avatars/female/f12-nova.webp',
    tags: ['Buzzcut', 'Red Hair', 'Cyber Arm', 'Fierce', 'Orange'],
  },

  // --- CYBERSECURITY SPECIALISTS ---
  {
    id: 'avatar-s01-kai-pentester',
    name: 'Kai "Lockpick"',
    role: 'Penetration Tester',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/specialists/s01-kai-pentester.webp',
    tags: ['Pentest', 'Bandana', 'Lockpick', 'Green'],
  },
  {
    id: 'avatar-s02-vera-redteam',
    name: 'Vera "Nightfall"',
    role: 'Red Team Operator',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/specialists/s02-vera-redteam.webp',
    tags: ['Red Team', 'Platinum Hair', 'Scar', 'Red'],
  },
  {
    id: 'avatar-s03-daniel-blueteam',
    name: 'Daniel "Bulwark"',
    role: 'Blue Team Analyst',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/specialists/s03-daniel-blueteam.webp',
    tags: ['Blue Team', 'Headset', 'Defense', 'Blue'],
  },
  {
    id: 'avatar-s04-riko-threathunter',
    name: 'Riko "Tracker"',
    role: 'Threat Hunter',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/specialists/s04-riko-threathunter.webp',
    tags: ['Threat Hunting', 'Hood', 'Yellow Eyes', 'Olive'],
  },
  {
    id: 'avatar-s05-theo-malware',
    name: 'Theo "Specimen"',
    role: 'Malware Analyst',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/specialists/s05-theo-malware.webp',
    tags: ['Malware', 'Lab Coat', 'Glasses', 'Toxic Green'],
  },
  {
    id: 'avatar-s06-lena-network',
    name: 'Lena "Switchboard"',
    role: 'Network Engineer',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/specialists/s06-lena-network.webp',
    tags: ['Networking', 'Cables', 'Headlamp', 'Orange'],
  },
  {
    id: 'avatar-s07-marcus-forensics',
    name: 'Marcus "Evidence"',
    role: 'Digital Forensics Investigator',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/specialists/s07-marcus-forensics.webp',
    tags: ['Forensics', 'Trench Coat', 'Beard', 'Amber'],
  },
  {
    id: 'avatar-s08-emi-researcher',
    name: 'Emi "Hypothesis"',
    role: 'Security Researcher',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/specialists/s08-emi-researcher.webp',
    tags: ['Research', 'Silver Bob', 'Hoodie', 'Cyan'],
  },
  {
    id: 'avatar-s09-sol-cryptographer',
    name: 'Sol "Glyph"',
    role: 'Cryptographer',
    gender: 'neutral',
    category: 'specialist',
    url: '/avatars/specialists/s09-sol-cryptographer.webp',
    tags: ['Cryptography', 'Braid', 'Glyph Tattoo', 'Gold', 'Violet'],
  },
  {
    id: 'avatar-s10-priya-soc',
    name: 'Priya "Overwatch"',
    role: 'SOC Analyst',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/specialists/s10-priya-soc.webp',
    tags: ['SOC', 'Headset', 'Coffee', 'Indigo'],
  },
  {
    id: 'avatar-s11-hikaru-reverse',
    name: 'Hikaru "Disasm"',
    role: 'Reverse Engineer',
    gender: 'male',
    category: 'specialist',
    url: '/avatars/specialists/s11-hikaru-reverse.webp',
    tags: ['Reverse Engineering', 'Goggles', 'White Hair', 'Magenta'],
  },
  {
    id: 'avatar-s12-zara-vulnresearch',
    name: 'Zara "Zeroday"',
    role: 'Vulnerability Researcher',
    gender: 'female',
    category: 'specialist',
    url: '/avatars/specialists/s12-zara-vulnresearch.webp',
    tags: ['Vuln Research', 'Red Bob', 'Green Eyes', 'Bug'],
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
