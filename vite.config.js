import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cpSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(ROOT, 'dist')

// YouTrack app package layout:
//   dist/manifest.json, backend.js, settings.json, entity-extensions.json  <- copied from app/
//   dist/widgets/index.html + dist/widgets/assets/                          <- Vite build
// "indexPath" in the manifest is resolved relative to the widgets folder.
const youtrackAppPackage = () => ({
  name: 'youtrack-app-package',
  apply: 'build',
  buildStart() {
    rmSync(DIST, { recursive: true, force: true })
  },
  closeBundle() {
    cpSync(resolve(ROOT, 'app'), DIST, { recursive: true })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), youtrackAppPackage()],
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist/widgets',
    emptyOutDir: true,
  },
})
