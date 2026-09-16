import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    // Nitro turns the Start fetch handler into a deployable server. It detects
    // Vercel at build time and emits .vercel/output; locally it emits a Node
    // server at .output/server/index.mjs.
    nitro(),
    viteReact(),
  ],
});
