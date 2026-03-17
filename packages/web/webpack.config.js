const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: 'development',
    target: 'web',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '../electron-app/dist'),
        filename: 'bundle.js',
        publicPath: './',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            }
        ],
    },
    externals: {
        'canvas': 'commonjs canvas',
        'jsdom': 'commonjs jsdom'
    },
    resolve: {
        extensions: ['.js'],
        fallback: {
            "canvas": false,
            "jsdom": false
        }
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, '../electron-app/dist'),
        },
        port: 3000,
        open: true,
        hot: true,
        devMiddleware: {
            writeToDisk: true,
        },
        watchFiles: ['src/**/*']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/main.html'
        }),
    ],
};