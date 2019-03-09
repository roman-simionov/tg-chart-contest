const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'app/js'),
    filename: 'bundle.js'
  }
};