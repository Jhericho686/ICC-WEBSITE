import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    watch: {
      // Ignore image files that may be locked by the OS (prevents EBUSY crash)
      ignored: ['**/*.jfif', '**/*.mp4'],
    },
  },
})

