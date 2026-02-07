const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: {
      '/api': {
        target: 'http://cyptoya.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
