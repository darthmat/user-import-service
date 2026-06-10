import { resolve } from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

function config(projectDir: string) {
  return defineConfig({
    resolve: {
      alias: {
        '@': resolve(projectDir, './src'),
      },
    },
    test: {
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text'],
        exclude: [
          'node_modules/**',
          'dist/**',
          '**/__utils__*',
          '**/__utils__/**',
          '**/*.d.ts',
          '**/migrations/**',
          '**/utils/errors.ts',
          '**/utils/errorHandler.ts',
          '**/*.module.ts',
          '**/main.ts',
          '**/config.ts',
        ],
      },
      exclude: [...configDefaults.exclude, '**/dist/**', '__utils__/**'],
      reporters: 'verbose',
      passWithNoTests: true,
      root: projectDir,
      watch: false,
      testTimeout: 60_000,
      hookTimeout: 60_000,
    },
  });
}

export default config(__dirname);
