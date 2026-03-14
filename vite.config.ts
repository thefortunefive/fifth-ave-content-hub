import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    ssr: 'src/server.ts',
    rollupOptions: {
      output: {
        entryFileNames: 'server.js',
      },
    },
  },
})
