// SAMPLE:

import { BasePage } from "./BasePage.js";


export class PCCPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    this.selectors = {
      // selectFacility: `select option[value="${value}"]`,
      // selectFacility: (value) => `select option[value="${value}"]`,
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

  // TO DO: copy from isOnLoginPage() -- should revise
  async isOnPCCPage() {
    return this.getCurrentUrl().includes("/PointClickCare");
  }

  // TO DO: ensure option entered by user exists
  async chooseFacility(value) {
    // Ensure value is provided and not empty
    if (value !== undefined && value !== null) {
        // Use querySelector to find the option with the given value
        // const option = document.querySelector(`select option[value="${value}"]`);
        const option = document.querySelector(selectFacility);
    }
    }

}

