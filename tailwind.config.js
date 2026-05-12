/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg:          '#080B14',
          primary:     '#6C63FF',
          accent:      '#FFB800',
          surface:     '#0F1221',
          card:        '#171A2E',
          elevated:    '#1E2139',
          border:      '#252740',
          textPrimary: '#FFFFFF',
          textSecondary: '#9B9FBA',
          textHint:    '#5C607A',
          success:     '#10B981',
          warning:     '#FFB800',
          error:       '#FF4757',
          info:        '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)',
      },
    },
  },
  plugins: [],
};
