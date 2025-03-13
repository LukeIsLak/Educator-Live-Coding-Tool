import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

export default function override(config) {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/")
      }
    };
  
    config.plugins.push(new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'html', 'css']
    }));
  
    return config;
  };