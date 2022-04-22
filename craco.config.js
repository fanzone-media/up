module.exports = {
  style: {
    postcss: {
      plugins: [require('autoprefixer')],
    },
  },
  typescript: {
    allowSyntheticDefaultImports: true,
  },
};
