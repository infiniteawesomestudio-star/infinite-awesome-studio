import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Built output lands in landing/infinite-careers/ (served by Cloudflare Pages
// at /infinite-careers/). base must match that public path so hashed asset
// URLs resolve. Public demo build: VITE_DEMO_MODE=true npm run build.
export default defineConfig({
  plugins: [react()],
  base: '/infinite-careers/',
  build: {
    outDir: '../landing/infinite-careers',
    emptyOutDir: true,
  },
})
