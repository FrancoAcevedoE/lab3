const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Cambia al puerto donde corre tu backend
        changeOrigin: true,
        pathRewrite: { '^/api': '' }, // Elimina el prefijo /api al hacer la solicitud
      },
    },
  },
});
