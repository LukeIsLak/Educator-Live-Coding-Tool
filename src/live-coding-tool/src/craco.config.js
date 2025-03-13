const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    webpack: {
        plugins: {
            add: [
                new MonacoWebpackPlugin({
                    languages: ['javascript', 'typescript', 'html', 'css']
                })
            ]
        },
        configure: {
            resolve: {
                fallback: {
                    "crypto": require.resolve("crypto-browserify")
                }
            }
        }
    }
};