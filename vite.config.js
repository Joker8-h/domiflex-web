import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: process.env.PORT || 5173,
    allowedHosts: ['domiflex-web-production.up.railway.app', 'domiflex-backend-production.up.railway.app']
  }
})
