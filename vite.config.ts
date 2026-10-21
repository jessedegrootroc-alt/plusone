import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // OneDrive-mappen geven niet altijd file-events door; pollen houdt hot reload betrouwbaar.
  server: { host: true, watch: { usePolling: true, interval: 300 } },
})
