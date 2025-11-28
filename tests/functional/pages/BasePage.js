export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(url) {
    await this.page.goto(url);
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForSelector(selector, options = {}) {
    return await this.page.waitForSelector(selector, {
      state: "visible",
      timeout: 10000,
      ...options,
    });
  }

  async clickElement(selector) {
    console.log(`🖱️ Clicking element: ${selector}`);
    await this.waitForSelector(selector);
    await this.page.click(selector);
  }

  async fillField(selector, value) {
    const isPassword = selector.toLowerCase().includes('password');
    console.log(`⌨️ Filling field ${selector} with: ${isPassword ? '[HIDDEN]' : value}`);
    await this.waitForSelector(selector);
    if (isPassword) {
      await this.page.locator(selector).pressSequentially(value);
    } else {
      await this.page.fill(selector, value);
    }
  }

  async getTextContent(selector) {
    await this.waitForSelector(selector);
    return await this.page.textContent(selector);
  }

  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, {
        state: "visible",
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getElementById(id) {
    return this.page.locator(`#${id}`);
  }

  async getElementByClass(className) {
    return this.page.locator(`.${className}`);
  }

  async takeScreenshot(name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const screenshotPath = `test-results/screenshots/${name}-${timestamp}.png`;

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.log(`❌ Failed to take screenshot: ${error.message}`);
    }
  }

  getCurrentUrl() {
    return this.page.url();
  }

  async getTitle() {
    return await this.page.title();
  }

  async waitForNavigation() {
    await this.page.waitForLoadState("networkidle");
  }

  logStep(message) {
    console.log(`🔷 ${message}`);
  }
}
