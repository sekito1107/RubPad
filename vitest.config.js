import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
<<<<<<< HEAD
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
=======
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
>>>>>>> 3eca791 (RuntimeドメインのTypeScript化とユニットテストの追加 (6 passed))
  },
})
