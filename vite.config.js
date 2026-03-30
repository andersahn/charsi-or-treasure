import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Use repo name as base when building for GitHub Pages
  base: process.env.GITHUB_ACTIONS ? '/charsi-or-treasure/' : '/',
})
