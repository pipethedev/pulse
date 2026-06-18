export const SANDBOX_SCREENSHOT_SCRIPT = String.raw`
const puppeteer = require("puppeteer");

const NAV_TIMEOUT_MS = 20000;
const VIEWPORT = { width: 1280, height: 800 };

async function main() {
  const url = process.env.TARGET_URL;
  if (!url) {
    process.stdout.write(JSON.stringify({
      status: "error", statusCode: null, latencyMs: null,
      screenshotBase64: null, error: "TARGET_URL not set",
    }));
    return;
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    const startedAt = Date.now();
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: NAV_TIMEOUT_MS,
    });
    const latencyMs = Date.now() - startedAt;

    const statusCode = response ? response.status() : null;
    const png = await page.screenshot({ type: "png", fullPage: false });

    process.stdout.write(JSON.stringify({
      status: statusCode && statusCode < 400 ? "up" : "down",
      statusCode,
      latencyMs,
      screenshotBase64: png.toString("base64"),
      error: null,
    }));
  } catch (err) {
    process.stdout.write(JSON.stringify({
      status: "down", statusCode: null, latencyMs: null,
      screenshotBase64: null, error: err instanceof Error ? err.message : String(err),
    }));
  } finally {
    await browser.close();
  }
}

main();
`;
