module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    spacing: {
      0: '0px',
      2: '2px',
      4: '4px',
      8: '8px',
      16: '16px',
      32: '32px',
      64: '64px',
      24: '24px',
      40: '40px',
      48: '48px',
      56: '56px',
      72: '72px',
    },
    fontSize: {
      xs: ['12px', '16px'],
      s: ['14px', '16px'],
      base: ['16px', '24px'],
      'm-l': ['18px', '24px'],
      'm-xl': ['20.25px', '24px'],
      'm-2xl': ['22.78px', '24px'],
      'm-3xl': ['25.63px', '32px'],
      'm-4xl': ['28.83px', '32px'],
      't-l': ['19.2px', '24px'],
      't-xl': ['23.04px', '32px'],
      't-2xl': ['27.65px', '32px'],
      't-3xl': ['33.18px', '40px'],
      't-4xl': ['39.81px', '48px'],
    },
    gridTemplateColumns: {
      4: 'repeat(4, 1fr)',
      8: 'repeat(8, 1fr)',
      12: 'repeat(12, 1fr)',
    },
    borderRadius: {
      none: '0px',
      DEFAULT: '4px',
      8: '8px',
      16: '16px',
      32: '32px',
      full: '9999px',
    },
    extend: {
      keyframes: {
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '33%': { transform: 'scale(1.25)' },
          '40%': { transform: 'scale(1)' },
          '66%': { transform: 'scale(1.25) ' },
          '73%,100%': { transform: 'scale(1) ' },
        },
        fadeInDown: {
          '0%': { opacity: 0, top: 0 },
          '100%': { opacity: 1, top: 16 },
        },
      },
      backgroundImage: {
        'linear-search': 'linear-gradient(72deg, #F0ABFC 0%, #F5D0FE 100%)',
        'linear-page':
          'linear-gradient(160deg, #FAE8FF 33.90%, #F5D0FE 34%, #F5D0FE 48.90%, #D946EF 49%)',
        'linear-wrapper': 'linear-gradient(210deg, #F0ABFC 12.5%, #E879F9 54%)',
      },
      boxShadow: {
        wrapper: '-8px 8px 8px rgba(112, 26, 117, 0.05)',
        glass:
          '-8px 8px 8px rgba(112, 26, 117, 0.05), inset 4px -4px 8px rgba(253, 244, 255, 0.1), inset -4px 4px 8px rgba(253, 244, 255, 0.2)',
        shape:
          '-8px 8px 0 rgba(217, 70, 239, 0.75), -16px 16px 0 rgba(112, 26, 117, 0.75), inset -4px 4px 8px rgba(250, 232, 255, 0.5), inset 8px -8px 16px rgba(112, 26, 117, 0.5)',
      },
    },
  },
  plugins: [],
}
