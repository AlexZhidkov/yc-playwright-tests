import { BasePage } from "./BasePage.js";

export class LogoutPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      avatarButton: "#avatar-image",
      memberAvatarButton: '[data-testid="avatar-button"]',
      logoutButton: '[data-testid="logout-button"]',
    };
  }

  async logout() {
    console.log("🚪 Starting logout process...");

    try {
      if (await this.isVisible(this.selectors.logoutButton)) {
        console.log("Found visible logout button, clicking directly...");
        await this.clickElement(this.selectors.logoutButton);
        return await this.verifyLogoutSuccess();
      }
    } catch (error) {
    }

    try {
      console.log("Clicking avatar button...");
      // Try standard avatar button first
      if (await this.isVisible(this.selectors.avatarButton)) {
        await this.clickElement(this.selectors.avatarButton);
      } else if (await this.isVisible(this.selectors.memberAvatarButton)) {
        // Try member-specific avatar button
        await this.clickElement(this.selectors.memberAvatarButton);
      } else {
        throw new Error("No avatar button found");
      }
      
      await this.page.waitForTimeout(500);
      if (await this.isVisible(this.selectors.logoutButton)) {
        console.log("Found logout button after avatar click, clicking...");
        await this.clickElement(this.selectors.logoutButton);
        return await this.verifyLogoutSuccess();
      }
    } catch (error) {
      console.log("❌ Logout via avatar failed: " + error.message);
    }

    console.log("❌ Could not find logout button or avatar");
    await this.takeScreenshotForDebugging();
    return false;
  }

  async verifyLogoutSuccess() {
    console.log("Verifying logout success...");

    try {
      await this.page.waitForURL(
        (url) => {
          const urlString = url.toString();
          return (
            urlString.includes("/sign-in") ||
            urlString.includes("/user/about") ||
            urlString.includes("/about") ||
            urlString.includes("/login") ||
            (!urlString.includes("/admin") && !urlString.includes("/manager"))
          );
        },
        { timeout: 10000 }
      );

      const currentUrl = this.getCurrentUrl();
      console.log(`✅ Logout successful - redirected to: ${currentUrl}`);
      return true;
    } catch (error) {
      console.log("No redirect detected, checking for login form...");

      try {
        await this.page.goto("/sign-in");
        await this.page.waitForLoadState("networkidle");

        const loginFormVisible = await this.isLoginFormVisible();
        if (loginFormVisible) {
          console.log("✅ Logout verified - can access login form");
          return true;
        }
      } catch { }

      console.log("❌ Could not verify logout success");
      return false;
    }
  }

  async isLoginFormVisible() {
    try {
      return await this.isVisible("#login-form");
    } catch {
      return false;
    }
  }

  async forceLogout() {
    console.log("🔄 Forcing logout by navigating to login page...");

    await this.page.goto("/sign-in", { timeout: 60000 });
    await this.page.waitForLoadState("networkidle");

    const loginFormVisible = await this.isLoginFormVisible();

    if (loginFormVisible) {
      console.log("✅ Force logout successful");
      return true;
    } else {
      console.log("❌ Force logout failed - still appears to be logged in");
      return false;
    }
  }

  async performLogout() {
    const normalLogout = await this.logout();

    if (normalLogout) {
      return { success: true, method: "normal" };
    }

    console.log("Normal logout failed, trying force logout...");
    const forceLogout = await this.forceLogout();

    return {
      success: forceLogout,
      method: forceLogout ? "force" : "failed",
    };
  }

  async takeScreenshotForDebugging() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await this.page.screenshot({
        path: `test-results/logout-debug-${timestamp}.png`,
        fullPage: true,
      });
      console.log(`📸 Debug screenshot saved: logout-debug-${timestamp}.png`);
    } catch (error) {
      console.log(`❌ Failed to take debug screenshot: ${error.message}`);
    }
  }
}
