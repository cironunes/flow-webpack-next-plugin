module.exports = {
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-class-properties',
    'add-module-exports',
  ],
  presets: ['@babel/preset-env', '@babel/preset-flow'],
};
