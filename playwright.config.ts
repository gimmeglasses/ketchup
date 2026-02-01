import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    // 失敗時のスクリーンショットを保存
    screenshot: "only-on-failure",

    // ブラウザのUI、日付、通貨などを日本語化
    locale: "ja-JP",

    // HTTPリクエストの言語指定を日本語に
    extraHTTPHeaders: {
      "Accept-Language": "ja-JP,ja;q=0.9",
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // auth setup project：認証済み状態、テーブルデータクリアのために実行
    { name: "setup", testMatch: /setup\/.*\.setup\.ts/ },
    // {
    //   name: "chromium",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //   },
    // },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // Mobile Chrome（ゲスト用）：ゲスト状態（会員登録・ログイン〜ダッシュボード・タスク操作等）
    {
      name: "Mobile Chrome Guest",
      use: {
        ...devices["Pixel 5"],
      },
      // 以下のテストシナリオのみ実施する
      testMatch: [
        "**/application.spec.ts",
        "**/register.spec.ts",
        "**/top.spec.ts",
      ],
    },

    // Mobile Chrome (非ゲスト用)：認証済み状態（ダッシュボード・タスク操作等）
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        // storageStateを使ってログイン済み状態からテスト実行
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      // 以下のテストシナリオは除外する
      testIgnore: [
        "**/application.spec.ts",
        "**/register.spec.ts",
        "**/top.spec.ts",
      ],
    },
    // Mobile Safari（ゲスト用）：ゲスト状態（会員登録・ログイン〜ダッシュボード・タスク操作等）
    {
      name: "Mobile Safari Guest",
      use: { ...devices["iPhone 12"] },
      // 以下のテストシナリオは実施する
      testMatch: [
        "**/application.spec.ts",
        "**/register.spec.ts",
        "**/top.spec.ts",
      ],
    },
    // Mobile Safari (非ゲスト用)：認証済み状態（ダッシュボード・タスク操作等）
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        // storageStateを使ってログイン済み状態からテスト実行
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      // 以下のテストシナリオは除外する
      testIgnore: [
        "**/application.spec.ts",
        "**/register.spec.ts",
        "**/top.spec.ts",
      ],
    },
    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
