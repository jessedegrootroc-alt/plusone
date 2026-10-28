import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// npm run dev:ios: zelfde server, maar via HTTPS. iOS geeft de gyroscoop alleen vrij op een beveiligde verbinding.
const https = process.env.HTTPS === '1'

export default defineConfig({
  plugins: [react(), ...(https ? [basicSsl({ name: 'plusone-dev' })] : [])],
  // OneDrive-mappen geven niet altijd file-events door; pollen houdt hot reload betrouwbaar.
  server: { host: true, watch: { usePolling: true, interval: 300 } },
  // De app, de verhaalwebsite (docs/BRIEF-VERHAAL.md) en de animatic om de pacing van dat verhaal goed te keuren
  build: { rollupOptions: { input: { app: 'index.html', verhaal: 'verhaal.html', animatic: 'animatic.html' } } },
})
