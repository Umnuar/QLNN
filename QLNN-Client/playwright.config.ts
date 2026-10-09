import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 60000,
	expect: {
		timeout: 10000,
	},
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: [
		["list"],
		["html", { outputFolder: "playwright-report", open: "never" }],
	],
	use: {
		baseURL: "http://localhost:5174",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "off",
		viewport: { width: 1440, height: 900 },
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "npm run dev -- --force",
		url: "http://localhost:5174",
		reuseExistingServer: true,
		timeout: 60000,
		env: {
			VITE_API_URL: "http://localhost:5001/api",
		},
	},
});
