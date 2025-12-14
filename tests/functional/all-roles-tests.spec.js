import { test, expect } from "@playwright/test";
import { testConfig } from "./config/test-config.js";
import { LoginPage } from "./pages/LoginPage.js";
import { withRetry } from "./utils.js";

async function expectNoVisible(page, testId) {
  await expect(page.locator(`[data-testid="${testId}"]:visible`)).toHaveCount(0);
}

test.describe("All Roles Accessible Menu Items Test", async () => {
  let loginPage;
  const isResearchAndDevelopmentEnv = (process.env.ENV && process.env.NODE_ENV) === "development";
  console.log(
    `🚀 Starting tests on: ${testConfig.baseUrl}. isResearchAndDevelopmentEnv=${isResearchAndDevelopmentEnv}`
  );

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  async function logoutWithRetry(page) {
    await withRetry(
      async () => {
        await page.getByTestId("avatar-button").click();
        await page.getByTestId("logout-button").click();
        await expect(page.locator("h4")).toHaveText("Login");
      },
      { attempts: 3, backoffMs: 750 }
    );
  }

  test.skip("Admin on Desktop", async ({ page, context }) => {
    test.setTimeout(80000); // 1 minute for the whole test

    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.adminUser.email,
        testConfig.adminUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Login completed successfully");
    });

    await test.step("Walk all Pages via Menu", async () => {
      await Promise.all([page.waitForURL(/\/dashboard(?:\?|$|#|$)/), page.click("#nav-dashboard")]);
      await expect(page).toHaveURL(/\/dashboard(?:\?|$|#|$)/);
      await expect(page.getByRole("heading", { level: 3, name: "Calls History:" })).toHaveCount(1);
      await expect(page.getByTestId("view-transcript-button").first()).toBeVisible();

      await page.click("#nav-members");
      await expect(page.url()).toContain("/members");
      await expect(page.locator("h2")).toHaveText("Facility Members");
      await expect(page.getByTestId("add-member-button")).toBeVisible();

      await page.click("#nav-caller");
      await expect(page.url()).toContain("/caller");
      await expect(page.locator("h2")).toHaveText("Caller");
      await expect(page.getByTestId("call-button")).toBeVisible();
      await expect(page.getByTestId("hume-chat-button")).toBeVisible();
      await expect(page.getByTestId("eleven-labs-chat-button")).toBeVisible();

      await page.click("#nav-talk-to-me");
      await expect(page.url()).toContain("/voice-chat");
      await expect(page.locator("h2")).toHaveText("Ready to Chat?");
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();

      await page.click("#nav-hume-configs");
      await expect(page.url()).toContain("/hume-configs");
      await expect(page.getByRole("heading", { level: 1, name: "Hume Configs" })).toBeVisible();
      await expect(page.getByTestId("add-config-button")).toBeVisible();

      await page.click("#nav-users");
      await expect(page.url()).toContain("/users");
      await expect(page.locator("h2")).toHaveText("Users Management", { timeout: 50000 });

      await page.click("#nav-facilities");
      await expect(page.url()).toContain("/facilities");
      await expect(page.locator("h2")).toHaveText("Facilities Management");
      await expect(page.getByTestId("add-facility-button")).toBeVisible();

      await page.click("#nav-call-history");
      await expect(page.url()).toContain("/call-history");
      await expect(page.getByTestId("call-history-card").first()).toContainText("Initiated by");
      if (isResearchAndDevelopmentEnv) {
        await expect(page.getByTestId("download-audio-button-desktop").first()).toBeVisible();
        await expect(page.getByTestId("view-transcript-button-desktop").first()).toBeVisible();
      } else {
        await expectNoVisible(page, "download-audio-button-desktop");
        await expectNoVisible(page, "view-transcript-button-desktop");
      }

      await page.click("#nav-profile");
      await expect(page.url()).toContain("/profile");
      await expect(page.getByTestId("save-profile-button")).toBeVisible();
      await expect(page.getByTestId("change-password-button")).toBeVisible();

      await page.click("#nav-about");
      await expect(page.url()).toContain("/about");
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await page.goBack();
    });

    await test.step("Logout", async () => {
      await logoutWithRetry(page);
    });
  });

  test("Manager on Desktop", async ({ page, context }) => {
    test.setTimeout(120000); // 2 minutes for the whole test

    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.managerUser.email,
        testConfig.managerUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Login completed successfully");
    });

    await test.step("Protected routes not accessible", async () => {
      const homePageManager = "**/members";
      await expect(page.locator("#sidebar")).toBeVisible();
      await expect(page.locator("#nav-dashboard")).toBeHidden();
      await page.goto("/dashboard");
      await page.waitForURL(homePageManager, { timeout: 30000 });
      await expect(page.locator("#nav-caller")).toBeHidden();
      await page.goto("/caller");
      await page.waitForURL(homePageManager, { timeout: 30000 });
      await expect(page.locator("#nav-hume-configs")).toBeHidden();
      await page.goto("/hume-configs");
      await page.waitForURL(homePageManager, { timeout: 30000 });
      await expect(page.locator("#nav-users")).toBeHidden();
      await page.goto("/users");
      await page.waitForURL(homePageManager, { timeout: 30000 });
      await expect(page.locator("#nav-facilities")).toBeHidden();
      await page.goto("/facilities");
      await page.waitForURL(homePageManager, { timeout: 30000 });
    });

    await test.step("Navigate to Members page", async () => {
      await expect(page.locator("#sidebar")).toBeVisible();
      await expect(page.locator("#nav-members")).toBeVisible();
      await page.click("#nav-members");
      console.log("✅ Sidebar and Members menu item found");
    });

    await test.step("Verify Members page", async () => {
      await expect(page.url()).toContain("/members");
      await expect(page.locator("h2")).toHaveText("Facility Members");
      await expect(page.getByTestId("members-tab-button-desktop")).toBeVisible();
      await expect(page.getByTestId("facility-tab-button-desktop")).toBeVisible();
      await expect(page.getByTestId("activity-tab-button-desktop")).toBeVisible();
      await expect(page.getByTestId("add-member-button")).toBeVisible();
      await expect(page.getByTestId("member-row").first()).toBeVisible();
      await expect(page.getByTestId("member-row-talk-button-desktop").first()).toBeVisible();
      await expectNoVisible(page, "member-row-talk-button-mobile");
      await expect(page.getByTestId("member-row-call-button-desktop").first()).toBeVisible();
      await expectNoVisible(page, "member-row-call-button-mobile");
      console.log("✅ Successfully navigated to Members page");
    });

    await test.step("Facility Information Tab", async () => {
      await page.getByTestId("facility-tab-button-desktop").click();
      await expect(page.locator("h2")).toHaveText("Facility Information");
      await expect(page.getByTestId("save-changes-button-desktop")).toBeVisible();
      await expect(page.getByTestId("save-changes-button-mobile")).toBeHidden();
    });

    await test.step("Activity Log Tab", async () => {
      await page.getByTestId("activity-tab-button-desktop").click();
      await expect(page.locator("h2")).toHaveText("Activity Log");
      await expect(page.getByTestId("filters-button")).toBeVisible();
      await expect(page.getByTestId("refresh-button")).toBeVisible();
      await page.getByTestId("log-item-expand-toggle").first().click();
      await expect(page.getByTestId("log-item-details")).toBeVisible();
    });

    await test.step("Member Details page", async () => {
      await page.getByTestId("members-tab-button-desktop").click();

      const alexMemberRow = page.getByTestId("member-row").filter({ has: page.getByText("Alex") });
      await expect(alexMemberRow).toHaveCount(1);
      const alexEditButton = alexMemberRow.getByTestId("member-row-edit-button-desktop");
      await Promise.all([alexEditButton.click(), page.waitForURL(/\/manager\/members\/.*/)]);

      await expect(page).toHaveURL(/\/manager\/members\/.*/);
      await expect(page.locator("h2").first()).toHaveText("Member Information");
      await expect(page.getByTestId("save-button-desktop")).toBeVisible();
      await expect(page.getByTestId("member-name-input-desktop")).toBeVisible();
      await expect(page.getByTestId("member-name-input-mobile")).toBeHidden();
      await expect(page.getByTestId("member-phone-input-desktop")).toBeVisible();
      await expect(page.getByTestId("member-phone-input-mobile")).toBeHidden();
      await expect(page.getByTestId("refresh-call-history")).toHaveCount(2);
      await expect(page.getByTestId("call-time-settings")).toHaveCount(2);
      await expect(page.getByTestId("talk-to-member-button-desktop")).toBeVisible();
      await expect(page.getByTestId("talk-to-member-button-mobile")).toBeHidden();
      await expect(page.getByTestId("call-member-button-desktop")).toBeVisible();
      await expect(page.getByTestId("call-member-button-mobile")).toBeHidden();
      await expect(page.getByTestId("change-logs-button-desktop")).toBeVisible();
      await expect(page.getByTestId("change-logs-button-mobile")).toBeHidden();
      await expect(page.getByTestId("delete-member-button-desktop")).toBeVisible();
      await expect(page.getByTestId("delete-member-button-mobile")).toBeHidden();
    });

    await test.step("Change Logs page", async () => {
      await Promise.all([
        page.getByTestId("change-logs-button-desktop").click(),
        page.waitForURL(/\/manager\/members\/.*\/logs$/),
      ]);
      await expect(page).toHaveURL(/\/manager\/members\/.*\/logs$/);
      await expect(page.getByRole("heading", { level: 1, name: "Change Logs" })).toBeVisible();
      await expect(page.getByTestId("filters-button")).toBeVisible();
      await expect(page.getByTestId("refresh-button")).toBeVisible();
      await expect(page.getByRole("heading", { level: 3, name: "Activity History" })).toBeVisible();
      await page.getByTestId("log-item-expand-toggle").first().click();
      await expect(page.getByTestId("log-item-details")).toBeVisible();
      await page.goBack();
    });

    await test.step("Call Summary popup", async () => {
      await page.getByTestId("call-history-card-desktop").first().click();
      await expect(page.getByTestId("close-call-summary-button")).toBeVisible();
      await page.getByTestId("close-call-summary-button").click();
    });

    await test.step("Call Transcript page", async () => {
      await page.getByTestId("call-history-card-desktop").first().click();
      if (isResearchAndDevelopmentEnv) {
        await page.getByTestId("call-transcript-button").click();
        try {
          await expect(page.getByRole("heading", { level: 1, name: "Call Transcript" })).toBeVisible();
          await expect(page.getByTestId("transcript-list")).toBeVisible();
        } catch (error) {
          await expect(page.locator("h2")).toHaveText("No Messages Found");
        }
        await page.goBack();
      } else {
        await expect(page.getByTestId("call-transcript-button")).toBeHidden();
        await expect(page.getByTestId("download-call-audio-button")).toBeHidden();
        await page.getByTestId("close-call-summary-button").click();
      }
    });

    await test.step("App Chat", async () => {
      const browser = page.context().browser().browserType().name();
      if (browser === "chromium" || browser === "firefox") {
        return;
      }
      await context.grantPermissions(["microphone"], { origin: testConfig.baseUrl });
      await page.getByTestId("talk-to-member-button-desktop").click();
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await page.getByTestId("start-voice-call-button").click();
      await expect(page.getByTestId("end-call-button")).toBeVisible({ timeout: 30000 });
      await page.getByTestId("end-call-button").click();
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();

      const testData = await page.evaluate(() => window.getHumeAccessTokenAndConfigIdResult);
      expect(testData).toBeDefined();
      expect(testData.requestPayload.baseHumeConfigId).toBeDefined();
      expect(testData.result.data.accessToken).toBeDefined();
      expect(testData.result.data.configId).toBeDefined();
      expect(testData.result.data.callId).toBeDefined();

      await page.goBack();
      console.log("✅ Voice call initiated successfully");
    });

    await test.step("Phone Call", async () => {
      await page.getByTestId("call-member-button-desktop").click();
      await expect(page.getByTestId("cancel-call-button")).toBeVisible();
      await page.getByTestId("call-now-button").click();

      const testData = await page.waitForFunction(() => window.makePersonalisedCallResult, null, { timeout: 60000 });
      const result = await testData.jsonValue();
      console.log("Twilio API: ", result);
      expect(result).toBeDefined();
      expect(result.status).toBe("active");

      console.log("✅ Phone call initiated successfully");
    });

    await test.step("Call History page", async () => {
      await expect(page.locator("#sidebar")).toBeVisible();
      await page.click("#nav-call-history");
      await expect(page.url()).toContain("/call-history");
      await expect(page.getByTestId("call-history-card").first()).toContainText("Initiated by");
      if (isResearchAndDevelopmentEnv) {
        await expect(page.getByTestId("download-audio-button-desktop").first()).toBeVisible();
        await page.getByTestId("view-transcript-button-desktop").first().click();
        await expect(page.url()).toContain("/events");
        try {
          await expect(page.getByRole("heading", { level: 1, name: "Call Transcript" })).toBeVisible();
          await expect(page.getByTestId("transcript-list")).toBeVisible();
        } catch (error) {
          await expect(page.locator("h2")).toHaveText("No Messages Found");
        }
      } else {
        await expectNoVisible(page, "download-audio-button-desktop");
        await expectNoVisible(page, "view-transcript-button-desktop");
      }
    });

    await test.step("Profile page", async () => {
      await expect(page.locator("#sidebar")).toBeVisible();
      await page.click("#nav-profile");
      await expect(page.url()).toContain("/profile");
      await expect(page.getByTestId("save-profile-button")).toBeVisible();
      await expect(page.getByTestId("change-password-button")).toBeVisible();
    });

    await test.step("Logout", async () => {
      await logoutWithRetry(page);
    });
  });

  test("Member on Desktop", async ({ page, context }) => {
    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.memberUser.email,
        testConfig.memberUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Login completed successfully");
    });

    await test.step("Protected routes not accessible", async () => {
      const homePageMember = "**/voice-chat";
      await expect(page.locator("#sidebar")).toBeHidden();
      return; // ToDo: remove when timeout issue is fixed
      await expect(page.locator("#nav-dashboard")).toBeHidden();
      await page.goto("/dashboard");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-members")).toBeHidden();
      await page.goto("/members");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-caller")).toBeHidden();
      await page.goto("/caller");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-hume-configs")).toBeHidden();
      await page.goto("/hume-configs");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-users")).toBeHidden();
      await page.goto("/users");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-facilities")).toBeHidden();
      await page.goto("/facilities");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-call-history")).toBeHidden();
      await page.goto("/call-history");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-profile")).toBeHidden();
      await page.goto("/profile");
      await page.waitForURL(homePageMember, { timeout: 30000 });
      await expect(page.locator("#nav-about")).toBeHidden();
      await page.goto("/about");
      await page.waitForURL(homePageMember, { timeout: 30000 });
    });

    await test.step("Walk all Pages via Menu", async () => {
      await expect(page.url()).toContain("/voice-chat");

      const browser = page.context().browser().browserType().name();
      if (browser === "chromium" || browser === "firefox") {
        return;
      }
      await context.grantPermissions(["microphone"], { origin: testConfig.baseUrl });

      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await page.getByTestId("start-voice-call-button").click();
      await expect(page.getByTestId("end-call-button")).toBeVisible({ timeout: 30000 });
      await page.getByTestId("end-call-button").click();
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await expect(page.url()).toContain("/voice-chat");

      const testData = await page.evaluate(() => window.getHumeAccessTokenAndConfigIdResult);
      expect(testData).toBeDefined();
      expect(testData.requestPayload.baseHumeConfigId).toBeDefined();
      expect(testData.result.data.accessToken).toBeDefined();
      expect(testData.result.data.configId).toBeDefined();
      expect(testData.result.data.callId).toBeDefined();
    });
  });

  test("User on Desktop", async ({ page, context }) => {
    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.userUser.email,
        testConfig.userUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Login completed successfully");
    });

    await test.step("Walk all Pages via Menu", async () => {
      await expect(page.url()).toContain("/about");
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await expect(page.getByTestId("logout-button")).toBeVisible();

      await expect(page.locator("#sidebar")).toBeVisible({ visible: false });
      // ToDo: https://github.com/Nakamoto-Labs/yapper-care/issues/203
      // page.goto('/voice-chat');
      await expect(page.url()).toContain("/about");
    });

    await test.step("Logout", async () => {
      await page.getByTestId("logout-button").click();
      await expect(page.locator("#login-submit-button")).toBeVisible();
      await expect(page.locator("h4")).toHaveText("Login");
    });
  });

  async function clickSideNavItem(page, id) {
    /*
        await page.waitForFunction(() => {
            const el = document.querySelector('#sidebar');
            if (!el) return true;
            const style = window.getComputedStyle(el);
            return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || el.classList.contains('hidden');
        }, null, { timeout: 3000 });
*/
    // await page.waitForTimeout(500); // Add a 500ms delay for animation/transition
    // await expect(page.locator('#sidebar')).toBeHidden();
    await page.getByTestId("sidenav-toggle").click();
    await page.waitForTimeout(500); // Add a 500ms delay for animation/transition
    await expect(page.locator("#sidebar")).toBeVisible();
    await page.click(id);
    await page.waitForTimeout(500); // Add a 500ms delay for animation/transition
    //await expect(page.locator('#sidebar')).toBeHidden();
  }

  test.skip("Admin on Mobile", async ({ page, context }) => {
    test.setTimeout(60000); // 1 minute for the whole test
    await page.setViewportSize({ width: 375, height: 812 });

    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.adminUser.email,
        testConfig.adminUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Login completed successfully");
    });

    await test.step("Walk all Pages via Menu", async () => {
      await clickSideNavItem(page, "#nav-dashboard");
      await expect(page.url()).toContain("/dashboard");
      await expect(page.getByRole("heading", { level: 3, name: "Calls History:" })).toHaveCount(1);
      await expect(page.getByTestId("view-transcript-button").first()).toBeVisible();

      await clickSideNavItem(page, "#nav-members");
      await expect(page.url()).toContain("/members");
      await expect(page.locator("h2")).toHaveText("Facility Members");
      await expect(page.getByTestId("add-member-button")).toBeVisible();

      await clickSideNavItem(page, "#nav-caller");
      await expect(page.url()).toContain("/caller");
      await expect(page.locator("h2")).toHaveText("Caller");
      await expect(page.getByTestId("call-button")).toBeVisible();
      await expect(page.getByTestId("hume-chat-button")).toBeVisible();
      await expect(page.getByTestId("eleven-labs-chat-button")).toBeVisible();

      await clickSideNavItem(page, "#nav-talk-to-me");
      await expect(page.url()).toContain("/voice-chat");
      await expect(page.locator("h2")).toHaveText("Ready to Chat?");
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();

      await clickSideNavItem(page, "#nav-hume-configs");
      await expect(page.url()).toContain("/hume-configs");
      await expect(page.getByRole("heading", { level: 1, name: "Hume Configs" })).toBeVisible();
      await expect(page.getByTestId("add-config-button")).toBeVisible();

      await clickSideNavItem(page, "#nav-users");
      await expect(page.url()).toContain("/users");
      await expect(page.locator("h2")).toHaveText("Users Management", { timeout: 30000 });

      await clickSideNavItem(page, "#nav-facilities");
      await expect(page.url()).toContain("/facilities");
      await expect(page.locator("h2")).toHaveText("Facilities Management");
      await expect(page.getByTestId("add-facility-button")).toBeVisible();

      await clickSideNavItem(page, "#nav-call-history");
      await expect(page.url()).toContain("/call-history");
      await expect(page.getByTestId("call-history-card").first()).toContainText("Initiated by");
      if (isResearchAndDevelopmentEnv) {
        await expect(page.getByTestId("download-audio-button-mobile").first()).toBeVisible();
        await expect(page.getByTestId("view-transcript-button-mobile").first()).toBeVisible();
      } else {
        await expectNoVisible(page, "download-audio-button-mobile");
        await expectNoVisible(page, "view-transcript-button-mobile");
      }

      await clickSideNavItem(page, "#nav-profile");
      await expect(page.url()).toContain("/profile");
      await expect(page.getByTestId("save-profile-button")).toBeVisible();
      await expect(page.getByTestId("change-password-button")).toBeVisible();

      await clickSideNavItem(page, "#nav-about");
      await expect(page.url()).toContain("/about");
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await page.goBack();
    });

    await test.step("Logout", async () => {
      await logoutWithRetry(page);
    });
  });

  test("Manager on Mobile", async ({ page, context }) => {
    test.setTimeout(120000); // 2 minutes for the whole test
    await page.setViewportSize({ width: 375, height: 812 });

    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.managerUser.email,
        testConfig.managerUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);
    });

    await test.step("Navigate to Members page", async () => {
      //await expect(page.locator('#sidebar')).toBeHidden();
      await page.getByTestId("sidenav-toggle").click();
      //await expect(page.locator('#sidebar')).toBeVisible();
      //await expect(page.locator('#nav-members')).toBeVisible();
      await page.click("#nav-members");
      // await expect(page.locator('#sidebar')).toBeHidden();
    });

    await test.step("Verify Members page", async () => {
      await expect(page.url()).toContain("/members");
      await expect(page.locator("h2")).toHaveText("Facility Members");
      await expect(page.getByTestId("members-tab-button-desktop")).toBeHidden();
      await expect(page.getByTestId("facility-tab-button-desktop")).toBeHidden();
      await expect(page.getByTestId("activity-tab-button-desktop")).toBeHidden();
      await expect(page.getByTestId("add-member-button")).toBeVisible();
      await expect(page.getByTestId("member-row").first()).toBeVisible();
      await expectNoVisible(page, "member-row-talk-button-desktop");
      await expect(page.getByTestId("member-row-talk-button-mobile").first()).toBeVisible();
      await expectNoVisible(page, "member-row-call-button-desktop");
      await expect(page.getByTestId("member-row-call-button-mobile").first()).toBeVisible();
    });

    await test.step("Facility Information Tab", async () => {
      await page.getByTestId("facility-tab-button-mobile").click();
      await expect(page.locator("h2")).toHaveText("Facility Information");
      await expect(page.getByTestId("save-changes-button-desktop")).toBeHidden();
      await expect(page.getByTestId("save-changes-button-mobile")).toBeVisible();
    });

    await test.step("Activity Log Tab", async () => {
      await page.getByTestId("activity-tab-button-mobile").click();
      await expect(page.locator("h2")).toHaveText("Activity Log");
      await expect(page.getByTestId("filters-button")).toBeVisible();
      await expect(page.getByTestId("refresh-button")).toBeVisible();
      await page.getByTestId("log-item-expand-toggle").first().click();
      await expect(page.getByTestId("log-item-details")).toBeVisible();
    });

    await test.step("Member Details page", async () => {
      await page.getByTestId("members-tab-button-mobile").click();

      const alexMemberRow = page.getByTestId("member-row").filter({ has: page.getByText("Alex") });
      await expect(alexMemberRow).toHaveCount(1);
      const alexEditButton = alexMemberRow.getByTestId("member-row-edit-button-mobile");
      await Promise.all([alexEditButton.click(), page.waitForURL(/\/manager\/members\/.*/)]);

      await expect(page).toHaveURL(/\/manager\/members\/.*/);
      await expect(page.locator("h2").first()).toHaveText("Member Information");
      await expect(page.getByTestId("save-button-desktop")).toBeHidden();
      await expect(page.getByTestId("save-button-mobile")).toBeVisible();
      await expect(page.getByTestId("member-name-input-desktop")).toBeHidden();
      await expect(page.getByTestId("member-name-input-mobile")).toBeVisible();
      await expect(page.getByTestId("member-phone-input-desktop")).toBeHidden();
      await expect(page.getByTestId("member-phone-input-mobile")).toBeVisible();
      await expect(page.getByTestId("refresh-call-history")).toHaveCount(2);
      await expect(page.getByTestId("call-time-settings")).toHaveCount(2);
      await expect(page.getByTestId("talk-to-member-button-desktop")).toBeHidden();
      await expect(page.getByTestId("talk-to-member-button-mobile")).toBeVisible();
      await expect(page.getByTestId("call-member-button-desktop")).toBeHidden();
      await expect(page.getByTestId("call-member-button-mobile")).toBeVisible();
      await expect(page.getByTestId("change-logs-button-desktop")).toBeHidden();
      await expect(page.getByTestId("change-logs-button-mobile")).toBeVisible();
      await expect(page.getByTestId("delete-member-button-desktop")).toBeHidden();
      await expect(page.getByTestId("delete-member-button-mobile")).toBeVisible();
    });

    await test.step("Change Logs page", async () => {
      await Promise.all([
        page.getByTestId("change-logs-button-mobile").click(),
        page.waitForURL(/\/manager\/members\/.*\/logs$/),
      ]);
      await expect(page).toHaveURL(/\/manager\/members\/.*\/logs$/);
      await expect(page.getByTestId("filters-button")).toBeVisible();
      await expect(page.getByTestId("refresh-button")).toBeVisible();
      await expect(page.getByRole("heading", { level: 3, name: "Activity History" })).toBeVisible();
      await page.getByTestId("log-item-expand-toggle").first().click();
      await expect(page.getByTestId("log-item-details")).toBeVisible();
      await page.goBack();
    });

    await test.step("Call Summary popup", async () => {
      await page.getByTestId("call-history-card-mobile").first().click();
      await expect(page.getByTestId("close-call-summary-button")).toBeVisible();
      await page.getByTestId("close-call-summary-button").click();
    });

    await test.step("Call Transcript page", async () => {
      await page.getByTestId("call-history-card-mobile").first().click();
      if (isResearchAndDevelopmentEnv) {
        await page.getByTestId("call-transcript-button").click();
        try {
          await expect(page.getByRole("heading", { level: 1, name: "Call Transcript" })).toBeVisible();
          await expect(page.getByTestId("transcript-list")).toBeVisible();
        } catch (error) {
          await expect(page.locator("h2")).toHaveText("No Messages Found");
        }
        await page.goBack();
      } else {
        await expect(page.getByTestId("call-transcript-button")).toBeHidden();
        await expect(page.getByTestId("download-call-audio-button")).toBeHidden();
        await page.getByTestId("close-call-summary-button").click();
      }
    });

    await test.step("App Chat", async () => {
      const browser = page.context().browser().browserType().name();
      if (browser === "chromium" || browser === "firefox") {
        return;
      }
      await context.grantPermissions(["microphone"], { origin: testConfig.baseUrl });
      await page.getByTestId("talk-to-member-button-mobile").click();
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await page.getByTestId("start-voice-call-button").click();
      await expect(page.getByTestId("end-call-button")).toBeVisible({ timeout: 30000 });
      await page.getByTestId("end-call-button").click();
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();

      const testData = await page.evaluate(() => window.getHumeAccessTokenAndConfigIdResult);
      expect(testData).toBeDefined();
      expect(testData.requestPayload.baseHumeConfigId).toBeDefined();
      expect(testData.result.data.accessToken).toBeDefined();
      expect(testData.result.data.configId).toBeDefined();
      expect(testData.result.data.callId).toBeDefined();

      await page.goBack();
    });

    await test.step("Phone Call", async () => {
      await page.getByTestId("call-member-button-mobile").click();
      await expect(page.getByTestId("cancel-call-button")).toBeVisible();
      await expect(page.getByTestId("call-now-button")).toBeVisible();
      await page.getByTestId("cancel-call-button").click();
    });

    await test.step("Call History page", async () => {
      await clickSideNavItem(page, "#nav-call-history");
      await expect(page.url()).toContain("/call-history");
      await expect(page.getByTestId("call-history-card").first()).toContainText("Initiated by");
      if (isResearchAndDevelopmentEnv) {
        await expect(page.getByTestId("download-audio-button-mobile").first()).toBeVisible();
        await page.getByTestId("view-transcript-button-mobile").first().click();
        try {
          await expect(page.getByRole("heading", { level: 1, name: "Call Transcript" })).toBeVisible();
          await expect(page.getByTestId("transcript-list")).toBeVisible();
        } catch (error) {
          await expect(page.getByRole("heading", { level: 2, name: "No Messages Found" })).toBeVisible();
        }
      } else {
        await expectNoVisible(page, "download-audio-button-mobile");
        await expectNoVisible(page, "view-transcript-button-mobile");
      }
    });

    await test.step("Profile page", async () => {
      await clickSideNavItem(page, "#nav-profile");
      await expect(page.url()).toContain("/profile");
      await expect(page.getByTestId("save-profile-button")).toBeVisible();
      await expect(page.getByTestId("change-password-button")).toBeVisible();
    });

    await test.step("Logout", async () => {
      await logoutWithRetry(page);
    });
  });

  test("Member on Mobile", async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.memberUser.email,
        testConfig.memberUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Login completed successfully");
    });

    await test.step("Walk all Pages via Menu", async () => {
      await expect(page.url()).toContain("/voice-chat");
    });
  });

  test("User on Mobile", async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await test.step("Login with email and password", async () => {
      await loginPage.navigateToLogin();
      expect(await loginPage.isOnLoginPage()).toBe(true);

      const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.userUser.email,
        testConfig.userUser.password
      );

      expect(loginResult.success).toBe(true);
      expect(await loginPage.isOnLoginPage()).toBe(false);

      console.log("✅ Login completed successfully");
    });

    await test.step("Walk all Pages via Menu", async () => {
      await expect(page.url()).toContain("/about");
      await expect(page.getByTestId("start-voice-call-button")).toBeVisible();
      await expect(page.getByTestId("logout-button")).toBeVisible();

      await expect(page.locator("#sidebar")).toBeVisible({ visible: false });
      // ToDo: https://github.com/Nakamoto-Labs/yapper-care/issues/203
      // page.goto('/voice-chat');
      await expect(page.url()).toContain("/about");
    });

    await test.step("Logout", async () => {
      await page.getByTestId("logout-button").click();
      await expect(page.locator("#login-submit-button")).toBeVisible();
      await expect(page.locator("h4")).toHaveText("Login");
    });
  });
});
