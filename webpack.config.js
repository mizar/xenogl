const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    'xenogl': './lib/index.js',
    'xenogl.es2016': './lib.es2016/index.js',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve('build'),
    library: 'XenoGL',
    libraryTarget: 'window',
  },
  plugins: [
    new webpack.DefinePlugin({'process.env': { NODE_ENV: JSON.stringify('production') }}),
  ],
};
