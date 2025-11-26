module.exports = {
  content: [
    './src/**/*.{html,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'green-1': '#06B060',
        'green-2': '#005B30',
      },
      fontFamily: {
        berlin: ['Berlin Sans FB Demi', 'sans-serif'],
        jaro: ['Jaro', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      spacing: {
        '471': '471px',
        '678': '678px',
      },
    },
  },
  plugins: [],
};