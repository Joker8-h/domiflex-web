import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: process.env.PORT || 5173,
    allowedHosts: ['domiflex-web-production.up.railway.app', 'domiflex-backend-production.up.railway.app']
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          admin: ['recharts', 'leaflet', 'react-leaflet'],
          qr: ['html5-qrcode', 'react-qr-code'],
        },
      },
    },
  },
})
