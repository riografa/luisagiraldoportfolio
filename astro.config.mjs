import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://riografia.github.io/luisagiraldoportfolio',
  base: '/luisagiraldoportfolio/',  // ✅ Siempre con subdirectorio
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@scripts': '/src/scripts'
      }
    }
  }
});
