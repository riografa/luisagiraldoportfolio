// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://riografa.github.io',
  base: 'riografa.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
});



