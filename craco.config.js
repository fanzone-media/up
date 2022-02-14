module.exports = {
    style: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    typescript: {
      allowSyntheticDefaultImports: true,
    }
  }
  