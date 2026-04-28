import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'NEXT_PUBLIC_E2E_MODE=true npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 }
      }
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 }
      }
    },
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 800 }
      }
    }
  ]
});
