import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://riografia.github.io/luisagiraldoportfolio',
  base: isProduction ? '/luisagiraldoportfolio/' : '/',  // ✅ Base dinámica
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@scripts': '/src/scripts'
      }
    }
  }
});
