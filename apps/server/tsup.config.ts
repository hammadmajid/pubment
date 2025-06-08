import { type Options, defineConfig } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/server.ts'],
  clean: true,
  format: ['esm'],
  outDir: './build',
  ...options,
}));
