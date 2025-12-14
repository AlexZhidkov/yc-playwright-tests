import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage.js";
import { PccPage } from "./pages/PccPage.js";
import { LogoutPage } from "./pages/LogoutPage.js";
import { testConfig } from "./config/test-config.js";

test.describe("PCC Page Functionality Test", () => {
  let loginPage;
  let pccPage;
  let logoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    pccPage = new PccPage(page);
    logoutPage = new LogoutPage(page);
    
    console.log(`🚀 Starting test on: ${testConfig.baseUrl}`);
  });


// Step 1: Log in to PCC page

test('Login with email and password', async ({ page }) => {
    test.step("Login with email and password", async () => {
        await pccPage.isOnPCCPage();
        
        console.log(`Print out test config PCC Email ${testConfig.pccUser.email}`);

        expect(await loginPage.isOnLoginPage()).toBe(true);

        const loginResult = await loginPage.loginWithEmailPassword(
        testConfig.pccUser.email,
        testConfig.pccUser.password
        );
        expect(loginResult.success).toBe(true);
        expect(await loginPage.isOnLoginPage()).toBe(false);

        console.log("✅ Step 1: Login completed successfully");
    });
});

// Step 2: Select Facility

/*
test('Choose Facility', async ({ page }) => {
    test.step("Choose Facility", async () => {
      await pccPage.isOnPCCPage();  
      await pccPage.selectFacility("12");
        

      console.log("✅ Step 2: Facility selection completed successfully");
    });
});*/

});





// Step 3: Edit Male, Female & Unknown

// Step 4: Talk to (diff) Male, Female & Unkown

// Step 5: Call (diff still) Male, Female & Unknown

// Step 6: Select new Facility

// **REPEAT STEPS 3-5**

// Step 7: Click "YAPPER CARE" and be redirected to home page

// Step 8: Click Notification Bell (and check pop up content)

// Step 9: Click PCC Icon


