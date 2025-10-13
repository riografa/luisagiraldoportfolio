// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://riografa.github.io",
  base: "/riografa.github.io",
  build: { assets: "assets" },
  integrations: [tailwind()],
});