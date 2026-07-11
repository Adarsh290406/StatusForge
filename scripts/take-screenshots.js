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

  // Look for system Chrome executable to avoid download issues
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  let executablePath = undefined;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      console.log(`Found system Chrome at: ${p}`);
      break;
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
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
    console.log("Entering credentials...");
    await page.type('input[name="email"]', "demo@demo.com");
    await page.type('input[name="password"]', "demo1234");
    
    // Submit form
    console.log("Submitting login form...");
    await page.click('button[type="submit"]');
    
    // Wait for SPA router redirection or fail re-render
    console.log("Waiting 5 seconds for transition to settle...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes("/admin")) {
      console.log("Authentication successful! Capturing Admin Dashboard...");
      const adminPath = path.join(SCREENSHOTS_DIR, "mobile_admin_dashboard.png");
      await page.screenshot({ path: adminPath });
      console.log(`Saved: ${adminPath}`);
    } else {
      console.log(`Authentication landed on ${currentUrl}. Saving screenshot anyway...`);
      const failPath = path.join(SCREENSHOTS_DIR, "mobile_admin_login_result.png");
      await page.screenshot({ path: failPath });
      console.log(`Saved screenshot: ${failPath}`);
    }

  } catch (error) {
    console.error("An error occurred during screenshot capture:", error);
  } finally {
    await browser.close();
    console.log("Browser closed. Capture process complete.");
  }
}

run();
