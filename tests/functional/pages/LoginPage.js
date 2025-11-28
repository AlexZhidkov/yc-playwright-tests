import { BasePage } from "./BasePage.js";

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      emailInput: "#email",
      passwordInput: "#password",
      loginForm: "#login-form",
      loginSubmitButton: "#login-submit-button",
      googleLoginButton: "#google-login-button",
      microsoftLoginButton: "#microsoft-login-button",
      facebookLoginButton: "#facebook-login-button",
      forgotPasswordButton: "#forgot-password-button",
      errorMessage: ".text-red-500",
      loadingSpinner: ".animate-spin",
    };
  }

  async navigateToLogin() {
    await this.goto("/sign-in");
    await this.waitForLoad();
  }

  async loginWithEmailPassword(email, password) {
    console.log(`🔐 Logging in with email: ${email}`);

    await this.waitForSelector(this.selectors.loginForm);
    
    await this.fillField(this.selectors.emailInput, email);
    await this.fillField(this.selectors.passwordInput, password);

    await this.clickElement(this.selectors.loginSubmitButton);

    try {
      await this.page.waitForURL(
        (url) => !url.toString().includes("/sign-in"),
        { timeout: 10000 }
      );
      console.log("✅ Login successful");
      return { success: true };
    } catch (error) {
      const hasError = await this.isVisible(this.selectors.errorMessage);
      if (hasError) {
        const errorText = await this.getTextContent(this.selectors.errorMessage);
        console.log(`❌ Login failed with error: ${errorText}`);
        return { success: false, error: errorText };
      }
      console.log(`❌ Login failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async isOnLoginPage() {
    return this.getCurrentUrl().includes("/sign-in");
  }

  async isLoginFormVisible() {
    return await this.isVisible(this.selectors.loginForm);
  }

  async loginWithGoogle() {
    console.log("🔐 Logging in with Google");
    await this.clickElement(this.selectors.googleLoginButton);
    return this.waitForAuthCompletion();
  }

  async loginWithMicrosoft() {
    console.log("🔐 Logging in with Microsoft");
    await this.clickElement(this.selectors.microsoftLoginButton);
    return this.waitForAuthCompletion();
  }

  async loginWithFacebook() {
    console.log("🔐 Logging in with Facebook");
    await this.clickElement(this.selectors.facebookLoginButton);
    return this.waitForAuthCompletion();
  }

  async waitForAuthCompletion() {
    try {
      await this.page.waitForURL(
        (url) => !url.toString().includes("/sign-in"),
        { timeout: 15000 }
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getErrorMessage() {
    if (await this.isVisible(this.selectors.errorMessage)) {
      return await this.getTextContent(this.selectors.errorMessage);
    }
    return null;
  }
}
