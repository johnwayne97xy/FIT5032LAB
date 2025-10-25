import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  // 👇 如果部署到 GitHub Pages，必须写仓库名
  // 比如 https://johnwayne97xy.github.io/FIT5032LAB/
  base: '/FIT5032LAB/',

  plugins: [
    vue(),
    vueDevTools(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },

  server: {
    port: 5173,
    open: true
  }
})