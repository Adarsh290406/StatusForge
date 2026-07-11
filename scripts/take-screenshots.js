const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "../docs/screenshots");

async function run() {
  console.log(`Starting automated screenshot capture targeting ${APP_URL}...`);

  // Ensure output directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log(`Created directory: ${SCREENSHOTS_DIR}`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 375,
    height: 667,
    isMobile: true,
    hasTouch: true,
  });

  try {
    // 1. Capture Landing Page
    console.log("Navigating to Landing Page...");
    await page.goto(`${APP_URL}/`, { waitUntil: "networkidle2" });
    const landingPath = path.join(SCREENSHOTS_DIR, "mobile_landing.png");
    await page.screenshot({ path: landingPath });
    console.log(`Saved: ${landingPath}`);

    // 2. Capture Public Status Page
    console.log("Navigating to Public Status Page...");
    await page.goto(`${APP_URL}/status`, { waitUntil: "networkidle2" });
    const statusPath = path.join(SCREENSHOTS_DIR, "mobile_status.png");
    await page.screenshot({ path: statusPath });
    console.log(`Saved: ${statusPath}`);

    // 3. Capture Incident History Page
    console.log("Navigating to Incident History Page...");
    await page.goto(`${APP_URL}/status/history`, { waitUntil: "networkidle2" });
    const historyPath = path.join(SCREENSHOTS_DIR, "mobile_history.png");
    await page.screenshot({ path: historyPath });
    console.log(`Saved: ${historyPath}`);

    // 4. Handle login and capture Admin Dashboard
    console.log("Navigating to Login Page to authenticate...");
    await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle2" });

    // Fill credentials
    console.log("Entering demo credentials...");
    await page.type('input[name="email"]', "demo@demo.com");
    await page.type('input[name="password"]', "demo1234");
    
    // Submit form
    console.log("Submitting login form...");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }),
    ]);

    const currentUrl = page.url();
    console.log(`Redirection url: ${currentUrl}`);

    if (currentUrl.includes("/admin")) {
      console.log("Login successful! Capturing Admin Dashboard...");
      const adminPath = path.join(SCREENSHOTS_DIR, "mobile_admin_dashboard.png");
      await page.screenshot({ path: adminPath });
      console.log(`Saved: ${adminPath}`);
    } else {
      console.log("Authentication redirect did not land on /admin. Saving failed state screenshot...");
      const failPath = path.join(SCREENSHOTS_DIR, "mobile_login_failed.png");
      await page.screenshot({ path: failPath });
      console.log(`Saved failure screenshot: ${failPath}`);
    }

  } catch (error) {
    console.error("An error occurred during screenshot capture:", error);
  } finally {
    await browser.close();
    console.log("Browser closed. Capture process complete.");
  }
}

run();
