const path = require('path');

module.exports = {
    entry: {
        main: ['./src/babel-polifil.js', './src/index.js'],
    },
    output: {
        path: path.resolve(__dirname, 'app/js'),
        filename: 'bundle-old.js',
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};
