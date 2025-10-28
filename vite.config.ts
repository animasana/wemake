import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [    
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths(),    
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "~": "/app",
      "components": "/components"
    }
  },
  server: {
    allowedHosts: true,
  },
});
