module.exports = {
  content: [
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
    fontFamily: {
      sans: ['Arial', 'sans-serif'],
    },
    fontSize: {
      xs: ['12px', '16px'],
      s: ['14px', '16px'],
      base: ['16px', '24px'],
      l: ['18px', '24px'],
      xl: ['20.25px', '24px'],
      '2xl': ['22.78px', '24px'],
      '3xl': ['25.63px', '32px'],
      '4xl': ['28.83px', '32px'],
      't-l': ['19.2px', '24px'],
      't-xl': ['23.04px', '32px'],
      't-2xl': ['27.65px', '32px'],
      't-3xl': ['33.18px', '40px'],
      't-4xl': ['39.81px', '48px'],
      'd-l': ['20px', '24px'],
      'd-xl': ['25px', '32px'],
      'd-2xl': ['31.25px', '40px'],
      'd-3xl': ['39.06px', '48px'],
      'd-4xl': ['48.83px', '56px'],
    },
    gridTemplateColumns: {
      4: 'repeat(4, 72px)',
      8: 'repeat(8, 72px)',
      12: 'repeat(12, 72px)',
    },
    extend: {},
  },
  plugins: [],
}
