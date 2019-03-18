const path = require('path');

module.exports = {
    entry: './src/index.js',
    devServer: {
        contentBase: './app'
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'app/js'),
        filename: 'bundle.js',
        devtoolModuleFilenameTemplate: "chart:///[resource-path]",
        devtoolFallbackModuleFilenameTemplate: "chart:///[resource-path]?[hash]"
    }
};
