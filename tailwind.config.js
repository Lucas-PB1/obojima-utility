module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Totoro
        totoro: {
          blue: '#4A90E2',      // Azul do céu
          green: '#7ED321',     // Verde da vegetação
          yellow: '#F5A623',    // Amarelo da camisa/chapéu
          gray: '#2C3E50',      // Cinza do Totoro
          orange: '#E67E22',    // Laranja dos shorts/bolsa
        },
        // Cores do sistema
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        muted: 'var(--muted)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
}
