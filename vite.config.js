// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // default
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'admin.tom-education.uz'
    ]
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'admin.tom-education.uz'
    ]
  }
})
