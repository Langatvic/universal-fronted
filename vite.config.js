import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend is a standalone app. It talks to the backend only through
// the URL in VITE_API_URL (see .env.development / .env.production).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
