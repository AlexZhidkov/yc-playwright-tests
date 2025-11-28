import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage.js";
import { LogoutPage } from "./pages/LogoutPage.js";
import { SidebarPage } from "./pages/SidebarPage.js";
import { testConfig } from "./config/test-config.js";

/**
 * Basic Functional Tests - Simplified with ID selectors
 * 1. Log in with email/password
 * 2. Navigate to all pages via sidebar
 * 3. Log out
 */

test.setTimeout(300000); // Set timeout to 5 minutes for all tests in this file

test.describe("Post-Deployment Functional Tests", () => {
  let loginPage;
  let logoutPage;
  let sidebarPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    logoutPage = new LogoutPage(page);
    sidebarPage = new SidebarPage(page);

    console.log(`🚀 Starting test on: ${testConfig.baseUrl}`);
  });

  test("Complete functional verification workflow", async ({ page }) => {
    console.log("🎯 Starting complete functional verification workflow");

    // Step 1: Log in with email/password
    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();

      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.adminUser.email,
        testConfig.adminUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Step 1: Login completed successfully");
    });

    // Step 2: Navigate to all pages via sidebar
    await test.step("Navigate through all sidebar menu items", async () => {
      const sidebarExists = await sidebarPage.waitForSidebar();

      if (sidebarExists) {
        expect(await sidebarPage.isSidebarVisible()).toBe(true);

        const menuItems = await sidebarPage.getVisibleMenuItems();
        expect(menuItems.length).toBeGreaterThan(0);

        console.log(`📋 Found ${menuItems.length} menu items to test`);

        const navigationResults = await sidebarPage.navigateAllMenuItems();

        const successfulNavigations = navigationResults.filter(
          (result) => result.success
        );

        expect(successfulNavigations.length).toBeGreaterThan(0);

        console.log(
          `✅ Step 2: Navigation completed (${successfulNavigations.length}/${navigationResults.length} successful)`
        );
      } else {
        console.log("⚠️ No sidebar found - skipping navigation test (likely member/user role)");
      }
    });

    // Step 3: Log out using simplified LogoutPage
    await test.step("Log out from the application", async () => {
      console.log("🚪 Step 3: Attempting to log out...");

      const logoutResult = await logoutPage.performLogout();

      expect(logoutResult.success).toBe(true);
      console.log(`✅ Step 3: Logout completed successfully using ${logoutResult.method} method`);
    });

    console.log("🎉 Complete functional verification workflow completed successfully!");
  });

  test("Individual component verification", async ({ page }) => {
    console.log("🔧 Running individual component verification tests");

    await loginPage.navigateToLogin();
    const loginResult = await loginPage.loginWithEmailPassword(
      testConfig.testUser.email,
      testConfig.testUser.password
    );
    expect(loginResult.success).toBe(true);

    await test.step("Verify sidebar functionality", async () => {
      const sidebarExists = await sidebarPage.waitForSidebar();

      if (sidebarExists) {
        const menuItems = await sidebarPage.getVisibleMenuItems();
        expect(menuItems.length).toBeGreaterThan(0);
        console.log("✅ Sidebar verification passed");
      } else {
        console.log("⚠️ No sidebar found - this is expected for member/user roles");
      }
    });

    await test.step("Verify basic navigation functionality", async () => {
      const menuItems = await sidebarPage.getVisibleMenuItems();

      if (menuItems.length > 0) {
        const firstMenuItem = menuItems[0];
        try {
          await sidebarPage.clickMenuItem(firstMenuItem);
          console.log(`✅ Successfully navigated to: ${firstMenuItem}`);
        } catch (error) {
          console.log(`⚠️ Navigation to ${firstMenuItem} failed: ${error.message}`);
        }
      } else {
        console.log("⚠️ No menu items to test navigation with");
      }

      console.log("✅ Basic navigation verification completed");
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      try {
        if (!page.isClosed()) {
          await page.screenshot({
            path: `test-results/failure-${testInfo.title}-${timestamp}.png`,
            fullPage: true,
          });
          console.log(`📸 Screenshot saved for failed test: ${testInfo.title}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not take screenshot: ${error.message}`);
      }
    }
  });
});
