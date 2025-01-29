import { defineConfig } from 'vite'
import process from 'process'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/hex_hw_week4/' : '/',
  plugins: [react()],
})
