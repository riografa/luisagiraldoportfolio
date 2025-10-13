// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://riografa.github.io",
  base: process.env.NODE_ENV === 'production' ? '/riografa.github.io' : '/',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
});
