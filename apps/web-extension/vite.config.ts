import { defineConfig } from "vite";
import { config } from "dotenv";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import tailwindcss from "@tailwindcss/vite";

config();

function generateManifest() {
    const manifest = readJsonFile("src/manifest.json");
    const pkg = readJsonFile("package.json");
    return {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        ...manifest,
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        webExtension({
            manifest: generateManifest,
        }),
        tailwindcss(),
    ],
});
