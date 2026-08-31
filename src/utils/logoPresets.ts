// Presets for Indonesian School Logos (Data URL SVG format)
export interface LogoPreset {
  id: string;
  name: string;
  category: 'Kemdikbud' | 'Sekolah Dasar' | 'Kemenag / MI' | 'Pancasila' | 'Umum';
  description: string;
  dataUrl: string;
}

// 1. Logo Tut Wuri Handayani (Resmi Kemendikbudristek)
export const TUT_WURI_HANDAYANI_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="85%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#075985"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>
  <!-- Outer Pentagon (Segi Lima) -->
  <polygon points="100,10 188,74 154,178 46,178 12,74" fill="url(#bgGrad)" stroke="#facc15" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="100,18 178,76 148,170 52,170 22,76" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
  <!-- Blencong / Api Suci / Obor Kemendikbud -->
  <path d="M100,32 C93,48 84,60 84,72 C84,85 91,92 100,92 C109,92 116,85 116,72 C116,60 107,48 100,32 Z" fill="url(#goldGrad)" stroke="#b45309" stroke-width="1.5"/>
  <circle cx="100" cy="70" r="5" fill="#ef4444"/>
  <!-- Burung Garuda Sayap Tut Wuri -->
  <path d="M100,78 L78,92 L62,84 L72,106 L48,104 L64,124 L42,130 L68,142 L100,126 L132,142 L158,130 L136,124 L152,104 L128,106 L138,84 L122,92 Z" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1.5"/>
  <!-- Buku Terbuka (Pendidikan) -->
  <path d="M100,122 C84,114 62,118 48,130 L48,146 C64,134 84,132 100,140 C116,132 136,134 152,146 L152,130 C138,118 116,114 100,122 Z" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>
  <!-- Ekor Sayap -->
  <path d="M92,142 L100,165 L108,142 Z" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1"/>
  <!-- Garis lipatan buku -->
  <line x1="100" y1="122" x2="100" y2="152" stroke="#0284c7" stroke-width="2"/>
</svg>
`)}`;

// 2. Logo Resmi Sekolah Dasar (Merah Putih - Bintang - Buku)
export const LOGO_SD_MERAH_PUTIH = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <!-- Segi Lima Coklat/Emas & Merah -->
  <polygon points="100,12 186,74 153,176 47,176 14,74" fill="#ffffff" stroke="#dc2626" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="100,22 174,77 145,166 55,166 26,77" fill="url(#redGrad)"/>
  
  <!-- Bintang Kuning di Atas -->
  <polygon points="100,32 105,47 121,47 108,56 113,71 100,62 87,71 92,56 79,47 95,47" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
  
  <!-- Buku Terbuka Putih -->
  <path d="M100,105 C85,96 65,98 52,108 L52,136 C67,126 85,124 100,132 C115,124 133,126 148,136 L148,108 C135,98 115,96 100,105 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <line x1="100" y1="105" x2="100" y2="142" stroke="#1e293b" stroke-width="2.5"/>
  
  <!-- Tulisan SD / Sekolah Dasar -->
  <circle cx="100" cy="85" r="16" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
  <text x="100" y="91" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#991b1b" text-anchor="middle">SD</text>
  
  <!-- Padi & Kapas Ringkasan -->
  <path d="M46,145 C42,115 50,75 75,55" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
  <path d="M154,145 C158,115 150,75 125,55" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Banner Bawah Pita -->
  <path d="M60,156 Q100,148 140,156 L135,168 Q100,160 65,168 Z" fill="#ffffff" stroke="#991b1b" stroke-width="1.5"/>
  <text x="100" y="163" font-family="Arial, sans-serif" font-size="7.5" font-weight="900" fill="#991b1b" text-anchor="middle">TUT WURI HANDAYANI</text>
</svg>
`)}`;

// 3. Logo Kemenag / Madrasah Ibtidaiyah (MI)
export const LOGO_MADRASAH_IBTIDAIYAH = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="greenGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#14532d"/>
    </radialGradient>
  </defs>
  <!-- Segi Lima Hijau Kemenag -->
  <polygon points="100,10 188,74 154,178 46,178 12,74" fill="url(#greenGrad)" stroke="#facc15" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="100,20 176,77 146,168 54,168 24,77" fill="none" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Bintang 8 Sinar Islam / Kemenag -->
  <g transform="translate(100,75) scale(0.65)">
    <polygon points="0,-40 12,-12 40,0 12,12 0,40 -12,12 -40,0 -12,-12" fill="#facc15"/>
    <polygon points="-28,-28 0,-18 28,-28 18,0 28,28 0,18 -28,28 -18,0" fill="#facc15" opacity="0.8"/>
  </g>
  
  <!-- Kitab Suci Al-Qur'an / Buku di Atas Rehal -->
  <path d="M100,95 C82,85 62,88 48,100 L48,128 C64,116 84,114 100,122 C116,114 136,116 152,128 L152,100 C138,88 118,85 100,95 Z" fill="#ffffff" stroke="#14532d" stroke-width="2"/>
  <line x1="100" y1="95" x2="100" y2="132" stroke="#14532d" stroke-width="2"/>
  <!-- Rehal / Tatakan Kayu Bawah -->
  <path d="M72,130 L128,154 M128,130 L72,154" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
  
  <!-- Pita Tulisan Bawah Ikhlas Beramal / MI -->
  <path d="M55,160 Q100,152 145,160 L140,172 Q100,164 60,172 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
  <text x="100" y="167" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#14532d" text-anchor="middle">IKHLAS BERAMAL</text>
</svg>
`)}`;

// 4. Logo Pelajar Pancasila & Karakter
export const LOGO_PELAJAR_PANCASILA = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="pancasilaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <!-- Circular Shield Emblem -->
  <circle cx="100" cy="100" r="90" fill="url(#pancasilaGrad)" stroke="#facc15" stroke-width="5"/>
  <circle cx="100" cy="100" r="80" fill="#ffffff" opacity="0.08"/>
  
  <!-- Garuda Wings Abstract -->
  <path d="M100,45 Q125,70 160,75 Q135,95 145,120 Q120,110 100,135 Q80,110 55,120 Q65,95 40,75 Q75,70 100,45 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  
  <!-- Shield Inside -->
  <path d="M100,65 Q122,75 120,105 Q115,130 100,145 Q85,130 80,105 Q78,75 100,65 Z" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Bintang di Tengah Perisai -->
  <polygon points="100,82 103,91 112,91 105,97 108,106 100,100 92,106 95,97 88,91 97,91" fill="#facc15"/>
  
  <!-- Banner Text -->
  <path d="M45,155 Q100,142 155,155 L150,172 Q100,158 50,172 Z" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
  <text x="100" y="166" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="#1e3a8a" text-anchor="middle">PROFIL PELAJAR PANCASILA</text>
</svg>
`)}`;

// 5. Logo Sekolah Swasta / Prestasi Unggul (Crest & Daun Laurel)
export const LOGO_PRESTASI_UNGGUL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="goldCrest" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <!-- Perisai Biru Gelap / Navy -->
  <path d="M100,15 Q165,20 165,85 Q165,145 100,185 Q35,145 35,85 Q35,20 100,15 Z" fill="url(#goldCrest)" stroke="#eab308" stroke-width="5"/>
  <path d="M100,24 Q155,28 155,85 Q155,138 100,174 Q45,138 45,85 Q45,28 100,24 Z" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
  
  <!-- Obor Pendidikan Emas -->
  <path d="M100,45 C95,58 90,68 90,78 C90,86 94,92 100,92 C106,92 110,86 110,78 C110,68 105,58 100,45 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
  <circle cx="100" cy="75" r="4" fill="#ef4444"/>
  <path d="M94,92 L106,92 L103,120 L97,120 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
  
  <!-- Daun Laurel Kiri & Kanan -->
  <path d="M60,135 Q50,90 70,60" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
  <path d="M140,135 Q150,90 130,60" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Buku Buka -->
  <path d="M100,120 C85,112 68,114 55,124 L55,145 C70,135 85,133 100,140 C115,133 130,135 145,145 L145,124 C132,114 115,112 100,120 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="100" y1="120" x2="100" y2="150" stroke="#0f172a" stroke-width="1.5"/>
  
  <!-- 3 Bintang Keunggulan -->
  <polygon points="100,28 102,34 108,34 103,38 105,44 100,40 95,44 97,38 92,34 98,34" fill="#facc15"/>
  <polygon points="80,35 81.5,39.5 86,39.5 82.5,42.5 84,47 80,44 76,47 77.5,42.5 74,39.5 78.5,39.5" fill="#facc15"/>
  <polygon points="120,35 121.5,39.5 126,39.5 122.5,42.5 124,47 120,44 116,47 117.5,42.5 114,39.5 118.5,39.5" fill="#facc15"/>
</svg>
`)}`;

export const SCHOOL_LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'tut-wuri',
    name: 'Tut Wuri Handayani (Kemendikbud)',
    category: 'Kemdikbud',
    description: 'Logo resmi Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI',
    dataUrl: TUT_WURI_HANDAYANI_LOGO,
  },
  {
    id: 'sd-merah-putih',
    name: 'Logo Sekolah Dasar (SD Merah Putih)',
    category: 'Sekolah Dasar',
    description: 'Emblem standar Sekolah Dasar dengan perisai merah putih dan bintang emas',
    dataUrl: LOGO_SD_MERAH_PUTIH,
  },
  {
    id: 'madrasah-ibtidaiyah',
    name: 'Madrasah Ibtidaiyah / Kemenag',
    category: 'Kemenag / MI',
    description: 'Logo bintang delapan dan kitab suci bernuansa hijau Ikhlas Beramal',
    dataUrl: LOGO_MADRASAH_IBTIDAIYAH,
  },
  {
    id: 'pelajar-pancasila',
    name: 'Profil Pelajar Pancasila',
    category: 'Pancasila',
    description: 'Simbol karakter mandiri, bernalar kritis, gotong royong dan berkebinekaan',
    dataUrl: LOGO_PELAJAR_PANCASILA,
  },
  {
    id: 'prestasi-unggul',
    name: 'Sekolah Unggul & Prestasi',
    category: 'Umum',
    description: 'Crest klasik elegan dengan obor pengetahuan dan daun kemenangan laurel',
    dataUrl: LOGO_PRESTASI_UNGGUL,
  },
];

/**
 * Converts any File object into a base64 DataURL with image compression
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxDimension: number = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's already an SVG, read directly as text Data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // High quality PNG for transparent logos
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
