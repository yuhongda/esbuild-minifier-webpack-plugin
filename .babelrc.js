const path = require('path');

module.exports = {
  presets: ['@babel/typescript', '@babel/preset-react'],
  env: {
    development: {
      presets: ['@babel/preset-env'],
    },
    production: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
      ],
    },
  },
  plugins: [
  ],
};
