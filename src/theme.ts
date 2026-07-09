/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ThemeColors {
  id: string;
  name: string;
  nameHi: string;
  primary: string;
  primaryHover: string;
  primaryDark: string;
  secondary: string;
  secondaryHover: string;
  borderLight: string;
  borderLighter: string;
  gradientStart: string;
  gradientEnd: string;
}

export const THEMES: ThemeColors[] = [
  {
    id: 'emerald',
    name: 'Amethyst Orchid',
    nameHi: 'अमेथिस्ट ऑर्किड',
    primary: '#9333ea', // purple-600
    primaryHover: '#7e22ce', // purple-700
    primaryDark: '#581c87', // purple-900
    secondary: '#faf5ff', // purple-50
    secondaryHover: '#f3e8ff', // purple-100
    borderLight: '#d8b4fe', // purple-300
    borderLighter: '#f3e8ff', // purple-100
    gradientStart: '#9333ea',
    gradientEnd: '#db2777', // pink-600
  },
  {
    id: 'saffron',
    name: 'Sweet Magenta',
    nameHi: 'मीठा मैजेंटा',
    primary: '#db2777', // pink-600
    primaryHover: '#be123c', // pink-700
    primaryDark: '#831843', // pink-900
    secondary: '#fff1f2', // pink-50
    secondaryHover: '#ffe4e6', // pink-100
    borderLight: '#fbcfe8', // pink-300
    borderLighter: '#ffe4e6', // pink-100
    gradientStart: '#db2777',
    gradientEnd: '#9333ea', // purple-600
  },
  {
    id: 'indigo',
    name: 'Royal Violet',
    nameHi: 'शाही बैंगनी',
    primary: '#7e22ce', // purple-700
    primaryHover: '#6b21a8', // purple-800
    primaryDark: '#2e0854', // purple-950
    secondary: '#faf5ff', // purple-50
    secondaryHover: '#f3e8ff', // purple-100
    borderLight: '#d8b4fe', // purple-300
    borderLighter: '#f3e8ff', // purple-100
    gradientStart: '#7e22ce',
    gradientEnd: '#be123c', // pink-700
  },
  {
    id: 'rose',
    name: 'Blossom Pink',
    nameHi: 'खिलता हुआ गुलाबी',
    primary: '#ec4899', // pink-500
    primaryHover: '#db2777', // pink-600
    primaryDark: '#9d174d', // pink-800
    secondary: '#fff1f2', // pink-50
    secondaryHover: '#ffe4e6', // pink-100
    borderLight: '#fbcfe8', // pink-300
    borderLighter: '#ffe4e6', // pink-100
    gradientStart: '#ec4899',
    gradientEnd: '#f472b6', // pink-400
  },
  {
    id: 'dark',
    name: 'Velvet Indigo',
    nameHi: 'मखमली इंडिगो',
    primary: '#6b21a8', // purple-800
    primaryHover: '#581c87', // purple-900
    primaryDark: '#2e0854', // purple-950
    secondary: '#faf5ff', // purple-50
    secondaryHover: '#f3e8ff', // purple-100
    borderLight: '#d8b4fe', // purple-300
    borderLighter: '#f3e8ff', // purple-100
    gradientStart: '#6b21a8',
    gradientEnd: '#db2777', // pink-600
  },
  {
    id: 'neon',
    name: 'Neon Dark',
    nameHi: 'नियोन डार्क',
    primary: '#00ffcc', // Vibrant Neon Cyan
    primaryHover: '#05ffd5', // Bright Cyan
    primaryDark: '#00ccac', // Darker Cyan
    secondary: '#0a0d18', // Deep Cyberpunk Space
    secondaryHover: '#12182c', // Medium Cyberpunk Space
    borderLight: '#1e293b', // Sleek dark border
    borderLighter: '#00ffcc', // Neon Cyan accent
    gradientStart: '#00ffcc',
    gradientEnd: '#f43f5e', // Hot pink-rose gradient end
  }
];

export function generateThemeStyles(theme: ThemeColors): string {
  const baseStyles = `
    :root {
      --theme-p: ${theme.primary};
      --theme-ph: ${theme.primaryHover};
      --theme-pd: ${theme.primaryDark};
      --theme-s: ${theme.secondary};
      --theme-sh: ${theme.secondaryHover};
      --theme-bl: ${theme.borderLight};
      --theme-blh: ${theme.borderLighter};
      --theme-gs: ${theme.gradientStart};
      --theme-ge: ${theme.gradientEnd};
    }

    /* Core backgrounds and text colors using emerald */
    .bg-emerald-600 { background-color: var(--theme-p) !important; }
    .bg-emerald-700 { background-color: var(--theme-ph) !important; }
    .hover\\:bg-emerald-600:hover { background-color: var(--theme-p) !important; }
    .hover\\:bg-emerald-700:hover { background-color: var(--theme-ph) !important; }
    .hover\\:bg-emerald-800:hover { background-color: var(--theme-pd) !important; }
    
    .text-emerald-600 { color: var(--theme-p) !important; }
    .text-emerald-700 { color: var(--theme-ph) !important; }
    .text-emerald-800 { color: var(--theme-pd) !important; }
    .text-emerald-500 { color: var(--theme-p) !important; }
    .text-emerald-900 { color: var(--theme-pd) !important; }
    .hover\\:text-emerald-600:hover { color: var(--theme-p) !important; }
    .hover\\:text-emerald-700:hover { color: var(--theme-ph) !important; }
    .hover\\:text-emerald-800:hover { color: var(--theme-pd) !important; }

    .bg-emerald-50 { background-color: var(--theme-s) !important; }
    .bg-emerald-100 { background-color: var(--theme-sh) !important; }
    .hover\\:bg-emerald-50:hover { background-color: var(--theme-s) !important; }
    .hover\\:bg-emerald-100:hover { background-color: var(--theme-sh) !important; }

    .border-emerald-500 { border-color: var(--theme-p) !important; }
    .border-emerald-600 { border-color: var(--theme-ph) !important; }
    .border-emerald-200 { border-color: var(--theme-bl) !important; }
    .border-emerald-100 { border-color: var(--theme-blh) !important; }
    .hover\\:border-emerald-200:hover { border-color: var(--theme-bl) !important; }
    .hover\\:border-emerald-500:hover { border-color: var(--theme-p) !important; }

    .focus\\:border-emerald-500:focus { border-color: var(--theme-p) !important; }
    .focus\\:ring-emerald-500:focus { --tw-ring-color: var(--theme-p) !important; }
    
    /* Selection styles */
    .selection\\:bg-emerald-100::selection { background-color: var(--theme-sh) !important; }
    .selection\\:text-emerald-900::selection { color: var(--theme-pd) !important; }

    /* Gradients */
    .from-emerald-500 { --tw-gradient-from: var(--theme-p) !important; --tw-gradient-to: transparent !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
    .from-emerald-600 { --tw-gradient-from: var(--theme-p) !important; --tw-gradient-to: transparent !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
    .to-teal-600 { --tw-gradient-to: var(--theme-ge) !important; }
    .to-emerald-600 { --tw-gradient-to: var(--theme-p) !important; }
    .via-teal-500 { --tw-gradient-stops: var(--tw-gradient-from), var(--theme-ge), var(--tw-gradient-to) !important; }
  `;

  if (theme.id === 'neon') {
    return `
      ${baseStyles}

      /* Global Neon Dark Theme Customizations */
      body, html {
        background-color: #060913 !important;
        color: #f1f5f9 !important;
      }

      /* Background Overrides */
      .bg-slate-50 { background-color: #060913 !important; }
      .bg-slate-100 { background-color: #11182c !important; }
      .bg-slate-200 { background-color: #1e293b !important; }
      .bg-white { background-color: #0b0f1d !important; color: #f1f5f9 !important; }

      /* Text color overrides */
      .text-slate-900, .text-slate-800 { color: #f8fafc !important; }
      .text-slate-700, .text-slate-600 { color: #cbd5e1 !important; }
      .text-slate-500 { color: #94a3b8 !important; }
      .text-slate-400 { color: #64748b !important; }

      /* Form controls & interactive elements */
      input, select, textarea {
        background-color: #0c1224 !important;
        border-color: #1e293b !important;
        color: #f8fafc !important;
      }
      input::placeholder {
        color: #475569 !important;
      }

      /* Card layouts */
      .bg-white.rounded-3xl, .bg-white.rounded-2xl, .bg-white.rounded-xl, .bg-white.rounded-lg {
        background-color: #0b0f1d !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 10px rgba(0, 255, 204, 0.03) !important;
        border: 1px solid #1e2a3c !important;
      }

      /* Active tabs or cards */
      .bg-emerald-50 { background-color: rgba(0, 255, 204, 0.08) !important; color: #00ffcc !important; }
      .text-emerald-900 { color: #00ffcc !important; }

      /* Borders */
      .border-slate-100 { border-color: #161f30 !important; }
      .border-slate-200 { border-color: #1e2a3c !important; }
      .border-slate-300 { border-color: #334155 !important; }

      /* Hover classes */
      .hover\\:bg-slate-50:hover { background-color: #11182c !important; }
      .hover\\:bg-slate-100:hover { background-color: #1a233d !important; }
      
      /* Transparency helpers */
      .bg-slate-50\\/65 { background-color: rgba(11, 15, 29, 0.65) !important; }
      .bg-slate-50\\/50 { background-color: rgba(11, 15, 29, 0.5) !important; }

      /* Header/footer styling */
      header, footer {
        background-color: #070b16 !important;
        border-color: #1e293b !important;
      }

      /* Support Drawer & Dialog Backgrounds */
      .fixed.inset-y-0.right-0 {
        background-color: #070b16 !important;
        border-color: #1e293b !important;
      }
    `;
  }

  return baseStyles;
}

export function getColorsAndDescForWeather(code: number, temp: number): {
  description: string;
  descriptionHi: string;
  icon: string;
  primary: string;
  primaryHover: string;
  primaryDark: string;
  secondary: string;
  secondaryHover: string;
  borderLight: string;
  borderLighter: string;
  gradientStart: string;
  gradientEnd: string;
} {
  // 0: Clear
  // 1, 2, 3: Mainly clear, partly cloudy, overcast
  // 45, 48: Fog
  // 51-55: Drizzle
  // 61-65, 80-82: Rain
  // 95-99: Thunderstorm
  if (code === 0 || code === 1) {
    return {
      description: temp > 35 ? 'Hot Orchid Day' : 'Sunny Orchid Skies',
      descriptionHi: temp > 35 ? 'भीषण गर्मी और धूप' : 'साफ और धूप',
      icon: '☀️',
      primary: '#db2777', // pink-600
      primaryHover: '#be123c', // pink-700
      primaryDark: '#831843', // pink-900
      secondary: '#fff1f2', // pink-50
      secondaryHover: '#ffe4e6', // pink-100
      borderLight: '#fbcfe8', // pink-300
      borderLighter: '#ffe4e6', // pink-100
      gradientStart: '#db2777',
      gradientEnd: '#ec4899', // pink-500
    };
  } else if (code === 2 || code === 3 || code === 45 || code === 48) {
    return {
      description: 'Cloudy Lavender',
      descriptionHi: 'बादल छाए हैं',
      icon: '☁️',
      primary: '#8b5cf6', // violet-500
      primaryHover: '#7c3aed', // violet-600
      primaryDark: '#4c1d95', // violet-900
      secondary: '#faf5ff', // purple-50
      secondaryHover: '#f3e8ff', // purple-100
      borderLight: '#d8b4fe', // purple-300
      borderLighter: '#f3e8ff', // purple-100
      gradientStart: '#8b5cf6',
      gradientEnd: '#6d28d9', // violet-700
    };
  } else if (
    (code >= 51 && code <= 55) ||
    (code >= 61 && code <= 65) ||
    (code >= 80 && code <= 82)
  ) {
    return {
      description: 'Purple Rain',
      descriptionHi: 'बरसात की बौछारें',
      icon: '🌧️',
      primary: '#9333ea', // purple-600
      primaryHover: '#7e22ce', // purple-700
      primaryDark: '#581c87', // purple-900
      secondary: '#faf5ff', // purple-50
      secondaryHover: '#f3e8ff', // purple-100
      borderLight: '#d8b4fe', // purple-300
      borderLighter: '#f3e8ff', // purple-100
      gradientStart: '#9333ea',
      gradientEnd: '#c084fc', // purple-400
    };
  } else if (code >= 95 && code <= 99) {
    return {
      description: 'Stormy Violet',
      descriptionHi: 'आंधी तूफान',
      icon: '⛈️',
      primary: '#7e22ce', // purple-700
      primaryHover: '#6b21a8', // purple-800
      primaryDark: '#2e0854', // purple-950
      secondary: '#faf5ff', // purple-50
      secondaryHover: '#f3e8ff', // purple-100
      borderLight: '#d8b4fe', // purple-300
      borderLighter: '#f3e8ff', // purple-100
      gradientStart: '#7e22ce',
      gradientEnd: '#581c87', // purple-900
    };
  } else {
    return {
      description: 'Mild Lilac Breeze',
      descriptionHi: 'हल्का मौसम',
      icon: '🍃',
      primary: '#9333ea', // purple-600
      primaryHover: '#7e22ce', // purple-700
      primaryDark: '#581c87', // purple-900
      secondary: '#faf5ff', // purple-50
      secondaryHover: '#f3e8ff', // purple-100
      borderLight: '#d8b4fe', // purple-300
      borderLighter: '#f3e8ff', // purple-100
      gradientStart: '#9333ea',
      gradientEnd: '#db2777', // pink-600
    };
  }
}

