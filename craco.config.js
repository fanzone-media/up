// const path = require('path');
// const fs = require('fs');
// const cracoBabelLoader = require('craco-babel-loader');

// // manage relative paths to packages
// const appDirectory = fs.realpathSync(process.cwd());
// const resolvePackage = (relativePath) =>
//   path.resolve(appDirectory, relativePath);

module.exports = {
  style: {
    postcss: {
      plugins: [require('autoprefixer')],
    },
  },
  typescript: {
    allowSyntheticDefaultImports: true,
  },
  // plugins: [
  //   {
  //     plugin: cracoBabelLoader,
  //     options: {
  //       includes: [
  //         resolvePackage('node_modules/@wagmi'),
  //         resolvePackage('node_modules/@web3modal'),
  //         resolvePackage('node_modules/@walletconnect'),
  //         resolvePackage('node_modules/wagmi'),
  //       ],
  //     },
  //   },
  // ],
};
