import { test, expect } from '@playwright/test';
import { testConfig } from "./config/test-config.js";
import { LoginPage } from './pages/LoginPage.js';
import { LogoutPage } from "./pages/LogoutPage.js";
import { SidebarPage } from "./pages/SidebarPage.js";

test.describe('Members Page', () => {
  let loginPage;
  let logoutPage;
  let sidebarPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    logoutPage = new LogoutPage(page);
    sidebarPage = new SidebarPage(page);

    console.log(`🚀 Starting test on: ${testConfig.baseUrl}`);
  });

  test('Members Page Desktop functionality', async ({ page, context }) => {
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

    await test.step("Navigate to Members page", async () => {
      await expect(page.locator('#sidebar')).toBeVisible();
      await expect(page.locator('#nav-members')).toBeVisible();
      await page.click("#nav-members");
      console.log("✅ Sidebar and Members menu item found");
    });

    await test.step("Verify Members page", async () => {
      await expect(page.url()).toContain('/members');
      await expect(page.locator('h2')).toHaveText('Facility Members');
      await expect(page.locator('[data-testid="members-tab-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="facility-tab-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-tab-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-member-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="member-row"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="member-row-talk-button-desktop"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="member-row-talk-button-mobile"]').first()).toBeHidden();
      await expect(page.locator('[data-testid="member-row-call-button-desktop"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="member-row-call-button-mobile"]').first()).toBeHidden();
      console.log("✅ Successfully navigated to Members page");
    });

    await test.step('Facility Information Tab', async () => {
      await page.locator('[data-testid="facility-tab-button-desktop"]').click();
      await expect(page.locator('h2')).toHaveText('Facility Information');
      await expect(page.locator('[data-testid="save-changes-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-changes-button-mobile"]')).toBeHidden();

    });

    await test.step('Activity Log Tab', async () => {
      await page.locator('[data-testid="activity-tab-button-desktop"]').click();
      await expect(page.locator('h2')).toHaveText('Activity Log');
      await expect(page.locator('[data-testid="filters-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="refresh-button"]')).toBeVisible();
      await page.locator('[data-testid="log-item-expand-toggle"]').first().click();
      await expect(page.getByTestId('log-item-details')).toBeVisible();
    });

    await test.step('Member Details page', async () => {
      await page.locator('[data-testid="members-tab-button-desktop"]').click();
      // Click on the first member in the list
      await page.locator('[data-testid="member-row"]').first().click();

      await expect(page).toHaveURL(/\/manager\/members\/.*/);
      await expect(page.locator('h2').first()).toHaveText('Member Information');
      await expect(page.locator('[data-testid="save-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="member-name-input-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="member-name-input-mobile"]')).toBeHidden();
      await expect(page.locator('[data-testid="member-phone-input-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="member-phone-input-mobile"]')).toBeHidden();
      await expect(page.locator('[data-testid="refresh-call-history"]')).toHaveCount(2);
      await expect(page.locator('[data-testid="call-time-settings"]')).toHaveCount(2);
      await expect(page.locator('[data-testid="talk-to-member-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="talk-to-member-button-mobile"]')).toBeHidden();
      await expect(page.locator('[data-testid="call-member-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="call-member-button-mobile"]')).toBeHidden();
      await expect(page.locator('[data-testid="change-logs-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="change-logs-button-mobile"]')).toBeHidden();
      await expect(page.locator('[data-testid="delete-member-button-desktop"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-member-button-mobile"]')).toBeHidden();
    });

    await test.step('Change Logs page', async () => {
      await page.locator('[data-testid="change-logs-button-desktop"]').click();
      await expect(page).toHaveURL(/\/manager\/members\/.*\/logs$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Change Logs' })).toBeVisible();
      await expect(page.locator('[data-testid="filters-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="refresh-button"]')).toBeVisible();
      await expect(page.getByRole('heading', { level: 3, name: 'Activity History' })).toBeVisible();
      await page.locator('[data-testid="log-item-expand-toggle"]').first().click();
      await expect(page.getByTestId('log-item-details')).toBeVisible();
      await page.goBack();
    });

    await test.step('Call Summary popup', async () => {
      await page.locator('[data-testid="call-history-card-desktop"]').first().click();
      await expect(page.locator('[data-testid="close-call-summary-button"]')).toBeVisible();
      await page.locator('[data-testid="close-call-summary-button"]').click();
    });

    await test.step('Call Transcript page', async () => {
      await page.locator('[data-testid="call-history-card-desktop"]').first().click();
      await page.locator('[data-testid="call-transcript-button"]').click();
      try {
        await expect(page.getByRole('heading', { level: 1, name: 'Call Transcript' })).toBeVisible();
        await expect(page.locator('[data-testid="transcript-list"]')).toBeVisible();
      } catch (error) {
        await expect(page.getByRole('heading', { level: 2, name: 'No Messages Found' })).toBeVisible();
      }
      await page.goBack();
    });

    await test.step('App Chat', async () => {
      await context.grantPermissions(['microphone'], { origin: testConfig.baseUrl });
      await page.locator('[data-testid="talk-to-member-button-desktop"]').click();
      await expect(page.locator('[data-testid="start-voice-call-button"]')).toBeVisible();
      await page.locator('[data-testid="start-voice-call-button"]').click();
      await expect(page.locator('[data-testid="end-call-button"]')).toBeVisible({ timeout: 30000 });
      await page.locator('[data-testid="end-call-button"]').click();
      await expect(page.locator('[data-testid="start-voice-call-button"]')).toBeVisible();

      const testData = await page.evaluate(() => window.getHumeAccessTokenAndConfigIdResult);
      expect(testData).toBeDefined();
      expect(testData.requestPayload.baseHumeConfigId).toBeDefined();
      expect(testData.result.data.accessToken).toBeDefined();
      expect(testData.result.data.configId).toBeDefined();
      expect(testData.result.data.callId).toBeDefined();

      await page.goBack();
      console.log("✅ Voice call initiated successfully");
    });

    await test.step('Phone Call', async () => {
      await page.locator('[data-testid="call-member-button-desktop"]').click();
      await expect(page.locator('[data-testid="cancel-call-button"]')).toBeVisible();
      await page.locator('[data-testid="call-now-button"]').click();

      const testData = await page.waitForFunction(() => window.makePersonalisedCallResult, null, { timeout: 60000 });
      const result = await testData.jsonValue();
      console.log("Twilio API: ", result);
      expect(result).toBeDefined();
      expect(result.status).toBe("active");

      console.log("✅ Phone call initiated successfully");
    });

    await test.step("Call History page", async () => {
      await expect(page.locator('#sidebar')).toBeVisible();
      await page.click("#nav-call-history");
      await expect(page.url()).toContain('/call-history');
      await expect(page.locator('[data-testid="call-history-card"]').first()).toContainText('Initiated by');
      await expect(page.locator('[data-testid="download-audio-button-desktop"]').first()).toBeVisible();
      await page.locator('[data-testid="view-transcript-button-desktop"]').first().click();
      await expect(page.url()).toContain('/events');
      try {
        await expect(page.getByRole('heading', { level: 1, name: 'Call Transcript' })).toBeVisible();
        await expect(page.locator('[data-testid="transcript-list"]')).toBeVisible();
      } catch (error) {
        await expect(page.locator('h2')).toHaveText('No Messages Found');
      }
    });

    await test.step("Profile page", async () => {
      await expect(page.locator('#sidebar')).toBeVisible();
      await page.click("#nav-profile");
      await expect(page.url()).toContain('/profile');
      await expect(page.locator('[data-testid="save-profile-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="change-password-button"]')).toBeVisible();
    });

    await test.step("Logout", async () => {
      await page.locator('[data-testid="avatar-button"]').click();
      await page.locator('[data-testid="logout-button"]').click();
      await expect(page.locator('h4')).toHaveText('Login');
    });

  });

  test('Members Page Mobile functionality', async ({ page, context }) => {
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
      await page.locator('[data-testid="sidenav-toggle"]').click();
      //await expect(page.locator('#sidebar')).toBeVisible();
      //await expect(page.locator('#nav-members')).toBeVisible();
      await page.click("#nav-members");
      // await expect(page.locator('#sidebar')).toBeHidden();
    });

    await test.step("Verify Members page", async () => {
      await expect(page.url()).toContain('/members');
      await expect(page.locator('h2')).toHaveText('Facility Members');
      await expect(page.locator('[data-testid="members-tab-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="facility-tab-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="activity-tab-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="add-member-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="member-row"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="member-row-talk-button-desktop"]').first()).toBeHidden();
      await expect(page.locator('[data-testid="member-row-talk-button-mobile"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="member-row-call-button-desktop"]').first()).toBeHidden();
      await expect(page.locator('[data-testid="member-row-call-button-mobile"]').first()).toBeVisible();
    });

    await test.step('Facility Information Tab', async () => {
      await page.locator('[data-testid="facility-tab-button-mobile"]').click();
      await expect(page.locator('h2')).toHaveText('Facility Information');
      await expect(page.locator('[data-testid="save-changes-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="save-changes-button-mobile"]')).toBeVisible();
    });

    await test.step('Activity Log Tab', async () => {
      await page.locator('[data-testid="activity-tab-button-mobile"]').click();
      await expect(page.locator('h2')).toHaveText('Activity Log');
      await expect(page.locator('[data-testid="filters-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="refresh-button"]')).toBeVisible();
      await page.locator('[data-testid="log-item-expand-toggle"]').first().click();
      await expect(page.getByTestId('log-item-details')).toBeVisible();
    });

    await test.step('Member Details page', async () => {
      await page.locator('[data-testid="members-tab-button-mobile"]').click();
      // Click on the first member in the list
      await page.locator('[data-testid="member-row"]').first().click();

      await expect(page).toHaveURL(/\/manager\/members\/.*/);
      await expect(page.locator('h2').first()).toHaveText('Member Information');
      await expect(page.locator('[data-testid="save-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="save-button-mobile"]')).toBeVisible();
      await expect(page.locator('[data-testid="member-name-input-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="member-name-input-mobile"]')).toBeVisible();
      await expect(page.locator('[data-testid="member-phone-input-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="member-phone-input-mobile"]')).toBeVisible();
      await expect(page.locator('[data-testid="refresh-call-history"]')).toHaveCount(2);
      await expect(page.locator('[data-testid="call-time-settings"]')).toHaveCount(2);
      await expect(page.locator('[data-testid="talk-to-member-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="talk-to-member-button-mobile"]')).toBeVisible();
      await expect(page.locator('[data-testid="call-member-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="call-member-button-mobile"]')).toBeVisible();
      await expect(page.locator('[data-testid="change-logs-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="change-logs-button-mobile"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-member-button-desktop"]')).toBeHidden();
      await expect(page.locator('[data-testid="delete-member-button-mobile"]')).toBeVisible();
    });

    await test.step('Change Logs page', async () => {
      await page.locator('[data-testid="change-logs-button-mobile"]').click();
      await expect(page).toHaveURL(/\/manager\/members\/.*\/logs$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Change Logs' })).toBeVisible();
      await expect(page.locator('[data-testid="filters-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="refresh-button"]')).toBeVisible();
      await expect(page.getByRole('heading', { level: 3, name: 'Activity History' })).toBeVisible();
      await page.locator('[data-testid="log-item-expand-toggle"]').first().click();
      await expect(page.getByTestId('log-item-details')).toBeVisible();
      await page.goBack();
    });

    await test.step('Call Summary popup', async () => {
      await page.locator('[data-testid="call-history-card-mobile"]').first().click();
      await expect(page.locator('[data-testid="close-call-summary-button"]')).toBeVisible();
      await page.locator('[data-testid="close-call-summary-button"]').click();
    });

    await test.step('Call Transcript page', async () => {
      await page.locator('[data-testid="call-history-card-mobile"]').first().click();
      await page.locator('[data-testid="call-transcript-button"]').click();
      try {
        await expect(page.getByRole('heading', { level: 1, name: 'Call Transcript' })).toBeVisible();
        await expect(page.locator('[data-testid="transcript-list"]')).toBeVisible();
      } catch (error) {
        await expect(page.getByRole('heading', { level: 2, name: 'No Messages Found' })).toBeVisible();
      }
      await page.goBack();
    });

    await test.step('App Chat', async () => {
      await context.grantPermissions(['microphone'], { origin: testConfig.baseUrl });
      await page.locator('[data-testid="talk-to-member-button-mobile"]').click();
      await expect(page.locator('[data-testid="start-voice-call-button"]')).toBeVisible();
      await page.locator('[data-testid="start-voice-call-button"]').click();
      await expect(page.locator('[data-testid="end-call-button"]')).toBeVisible({ timeout: 30000 });
      await page.locator('[data-testid="end-call-button"]').click();
      await expect(page.locator('[data-testid="start-voice-call-button"]')).toBeVisible();

      const testData = await page.evaluate(() => window.getHumeAccessTokenAndConfigIdResult);
      expect(testData).toBeDefined();
      expect(testData.requestPayload.baseHumeConfigId).toBeDefined();
      expect(testData.result.data.accessToken).toBeDefined();
      expect(testData.result.data.configId).toBeDefined();
      expect(testData.result.data.callId).toBeDefined();

      await page.goBack();
    });

    await test.step('Phone Call', async () => {
      await page.locator('[data-testid="call-member-button-mobile"]').click();
      await expect(page.locator('[data-testid="cancel-call-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="call-now-button"]')).toBeVisible();
      await page.locator('[data-testid="cancel-call-button"]').click();
    });

    await test.step("Call History page", async () => {
      await page.locator('[data-testid="sidenav-toggle"]').click();
      await expect(page.locator('#sidebar')).toBeVisible();
      await page.click("#nav-call-history");
      await expect(page.url()).toContain('/call-history');
      await expect(page.locator('[data-testid="call-history-card"]').first()).toContainText('Initiated by');
      await expect(page.locator('[data-testid="download-audio-button-mobile"]').first()).toBeVisible();
      await page.locator('[data-testid="view-transcript-button-mobile"]').first().click();
      try {
        await expect(page.getByRole('heading', { level: 1, name: 'Call Transcript' })).toBeVisible();
        await expect(page.locator('[data-testid="transcript-list"]')).toBeVisible();
      } catch (error) {
        await expect(page.getByRole('heading', { level: 2, name: 'No Messages Found' })).toBeVisible();
      }
    });

    await test.step("Profile page", async () => {
      await page.locator('[data-testid="sidenav-toggle"]').click();
      await expect(page.locator('#sidebar')).toBeVisible();
      await page.click("#nav-profile");
      await expect(page.url()).toContain('/profile');
      await expect(page.locator('[data-testid="save-profile-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="change-password-button"]')).toBeVisible();
    });

    await test.step("Logout", async () => {
      await page.locator('[data-testid="avatar-button"]').click();
      await page.locator('[data-testid="logout-button"]').click();
      await expect(page.locator('h4')).toHaveText('Login');
    });
  });
});
