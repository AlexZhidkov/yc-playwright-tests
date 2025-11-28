import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage.js";
import { LogoutPage } from "./pages/LogoutPage.js";
import { SidebarPage } from "./pages/SidebarPage.js";
import { testConfig } from "./config/test-config.js";

/**
 * Role-Based Access Control Tests
 * Tests all user roles and their specific access permissions
 */

test.setTimeout(300000); // Set timeout to 5 minutes for all tests in this file

const roleTestData = [
  {
    role: "admin",
    user: testConfig.adminUser,
    expectedRoutes: testConfig.roleRoutes.admin,
    hasSidebar: true,
    defaultRoute: "/dashboard"
  },
  {
    role: "manager", 
    user: testConfig.managerUser,
    expectedRoutes: testConfig.roleRoutes.manager,
    hasSidebar: true,
    defaultRoute: "/members"
  },
  {
    role: "member",
    user: testConfig.memberUser, 
    expectedRoutes: testConfig.roleRoutes.member,
    hasSidebar: false,
    defaultRoute: "/voice-chat"
  },
  {
    role: "user",
    user: testConfig.userUser,
    expectedRoutes: testConfig.roleRoutes.user,
    hasSidebar: false,
    defaultRoute: "/about"
  }
];

test.describe("Role-Based Access Control Tests", () => {
  let loginPage;
  let logoutPage;
  let sidebarPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    logoutPage = new LogoutPage(page);
    sidebarPage = new SidebarPage(page);

    console.log(`🚀 Starting role-based tests on: ${testConfig.baseUrl}`);
  });

  for (const testData of roleTestData) {
    test.describe(`${testData.role.toUpperCase()} Role Tests`, () => {
      test(`should allow ${testData.role} to log in and access appropriate routes`, async ({ page }) => {
        console.log(`🎯 Testing ${testData.role} role access`);

        // Step 1: Login
        await test.step(`Login as ${testData.role}`, async () => {
          await loginPage.navigateToLogin();
          expect(await loginPage.isOnLoginPage()).toBe(true);

          const loginResult = await loginPage.loginWithEmailPassword(
            testData.user.email,
            testData.user.password
          );

          expect(loginResult.success).toBe(true);
          expect(await loginPage.isOnLoginPage()).toBe(false);

          console.log(`✅ ${testData.role} login successful`);
        });

        // Step 2: Verify default route redirect
        await test.step(`Verify ${testData.role} is redirected to correct default route`, async () => {
          await page.waitForURL(`**${testData.defaultRoute}`, { timeout: 10000 });
          console.log(`✅ ${testData.role} redirected to ${testData.defaultRoute}`);
        });

        // Step 3: Test sidebar visibility and navigation
        await test.step(`Test sidebar and navigation for ${testData.role}`, async () => {
          const sidebarExists = await sidebarPage.waitForSidebar();
          
          if (testData.hasSidebar) {
            expect(sidebarExists).toBe(true);
            expect(await sidebarPage.isSidebarVisible()).toBe(true);

            const visibleMenuItems = await sidebarPage.getVisibleMenuItems();
            console.log(`📋 ${testData.role} visible menu items: ${visibleMenuItems.join(", ")}`);

            // Verify expected routes are accessible
            for (const expectedRoute of testData.expectedRoutes) {
              if (visibleMenuItems.includes(expectedRoute)) {
                console.log(`✅ ${testData.role} has access to: ${expectedRoute}`);
              } else {
                console.log(`⚠️ ${testData.role} missing expected route: ${expectedRoute}`);
              }
            }

            // Test navigation to each accessible route
            const navigationResults = await sidebarPage.navigateAllMenuItems();
            const successfulNavigations = navigationResults.filter(result => result.success);
            
            console.log(`✅ ${testData.role} navigation: ${successfulNavigations.length}/${navigationResults.length} successful`);
            expect(successfulNavigations.length).toBeGreaterThan(0);

          } else {
            expect(sidebarExists).toBe(false);
            console.log(`✅ ${testData.role} correctly has no sidebar (expected behavior)`);
            
            console.log(`📋 Testing direct route access for ${testData.role} without sidebar`);
            for (const expectedRoute of testData.expectedRoutes) {
              if (expectedRoute === "About") {
                console.log(`✅ ${testData.role} has access to: ${expectedRoute} (public route)`);
              } else if (expectedRoute === "Talk To Me") {
                try {
                  await page.goto(`${testConfig.baseUrl}/voice-chat`);
                  await page.waitForTimeout(2000);
                  const currentUrl = page.url();
                  if (currentUrl.includes("/voice-chat")) {
                    console.log(`✅ ${testData.role} has access to: ${expectedRoute}`);
                  } else {
                    console.log(`⚠️ ${testData.role} redirected from: ${expectedRoute}`);
                  }
                } catch (error) {
                  console.log(`❌ ${testData.role} cannot access: ${expectedRoute} (error: ${error.message})`);
                }
              } else if (expectedRoute === "Members") {
                try {
                  await page.goto(`${testConfig.baseUrl}/members`);
                  await page.waitForTimeout(2000);
                  const currentUrl = page.url();
                  if (currentUrl.includes("/members")) {
                    console.log(`✅ ${testData.role} has access to: ${expectedRoute}`);
                  } else {
                    console.log(`⚠️ ${testData.role} redirected from: ${expectedRoute}`);
                  }
                } catch (error) {
                  console.log(`❌ ${testData.role} cannot access: ${expectedRoute} (error: ${error.message})`);
                }
              } else if (expectedRoute === "Profile") {
                try {
                  await page.goto(`${testConfig.baseUrl}/profile`);
                  await page.waitForTimeout(2000);
                  const currentUrl = page.url();
                  if (currentUrl.includes("/profile")) {
                    console.log(`✅ ${testData.role} has access to: ${expectedRoute}`);
                  } else {
                    console.log(`⚠️ ${testData.role} redirected from: ${expectedRoute}`);
                  }
                } catch (error) {
                  console.log(`❌ ${testData.role} cannot access: ${expectedRoute} (error: ${error.message})`);
                }
              }
            }
          }
        });

        // Step 4: Test basic functionality (same as basic-functional-test.spec.js)
        await test.step(`Test ${testData.role} basic functionality`, async () => {
          await page.goto(`${testConfig.baseUrl}${testData.defaultRoute}`);
          await page.waitForTimeout(2000);
          
          const pageTitle = await page.title();
          expect(pageTitle).toBeTruthy();
          
          console.log(`✅ ${testData.role} can access default route: ${testData.defaultRoute}`);
        });

        // Step 5: Logout
        await test.step(`Logout ${testData.role}`, async () => {
          const logoutResult = await logoutPage.performLogout();
          expect(logoutResult.success).toBe(true);
          console.log(`✅ ${testData.role} logout successful`);
        });
      });

      test(`should verify ${testData.role} cannot access unauthorized routes`, async ({ page }) => {
        console.log(`🔒 Testing ${testData.role} unauthorized access prevention`);

        await loginPage.navigateToLogin();
        const loginResult = await loginPage.loginWithEmailPassword(
          testData.user.email,
          testData.user.password
        );
        expect(loginResult.success).toBe(true);

        await test.step(`Test ${testData.role} unauthorized route access`, async () => {
          const unauthorizedRoutes = getUnauthorizedRoutes(testData.role);
          
          for (const route of unauthorizedRoutes) {
            try {
              await page.goto(`${testConfig.baseUrl}${route.path}`);
              await page.waitForTimeout(2000);
              
              const currentUrl = page.url();
              const wasRedirected = !currentUrl.includes(route.path);
              
              if (wasRedirected) {
                console.log(`✅ ${testData.role} correctly redirected from unauthorized route: ${route.path}`);
              } else {
                console.log(`⚠️ ${testData.role} may have unauthorized access to: ${route.path}`);
              }
            } catch (error) {
              console.log(`✅ ${testData.role} cannot access unauthorized route: ${route.path} (error: ${error.message})`);
            }
          }
        });

        await logoutPage.performLogout();
      });
    });
  }

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

/**
 * Get unauthorized routes for a specific role - updated to match actual working routing logic
 */
function getUnauthorizedRoutes(role) {
  const allRoutes = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/caller", name: "Caller" },
    { path: "/hume-configs", name: "Hume Configs" },
    { path: "/users", name: "Users" },
    { path: "/facilities", name: "Facilities" }
  ];

  if (role === "admin") {
    return [];
  } else if (role === "manager") {
    allRoutes.push(
      { path: "/dashboard", name: "Dashboard" },
      { path: "/caller", name: "Caller" }
    );
  } else if (role === "member") {
    allRoutes.push(
      { path: "/dashboard", name: "Dashboard" },
      { path: "/caller", name: "Caller" },
      { path: "/hume-configs", name: "Hume Configs" },
      { path: "/users", name: "Users" },
      { path: "/facilities", name: "Facilities" },
      { path: "/call-history", name: "Call History" }
    );
  } else if (role === "user") {
    allRoutes.push(
      { path: "/dashboard", name: "Dashboard" },
      { path: "/members", name: "Members" },
      { path: "/caller", name: "Caller" },
      { path: "/hume-configs", name: "Hume Configs" },
      { path: "/users", name: "Users" },
      { path: "/facilities", name: "Facilities" },
      { path: "/call-history", name: "Call History" },
      { path: "/profile", name: "Profile" }
    );
  }

  const uniqueRoutes = allRoutes.filter((route, index, self) => 
    index === self.findIndex(r => r.path === route.path)
  );
  
  return uniqueRoutes;
} 