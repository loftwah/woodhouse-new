import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://woodhouse.loftwah.com",
  output: "static",
  build: {
    format: "directory",
    compressHTML: true
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
