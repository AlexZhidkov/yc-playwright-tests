import { BasePage } from "./BasePage.js";

export class SidebarPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async waitForSidebar() {
    console.log("⏳ Waiting for sidebar to load...");
    try {
      await this.waitForSelector("#sidebar", { timeout: 10000 });
      console.log("✅ Sidebar found");
      return true;
    } catch (error) {
      console.log("⚠️ Sidebar not found - this might be a member or user role without sidebar");
      return false;
    }
  }

  async isSidebarVisible() {
    return await this.isVisible("#sidebar");
  }

  async getVisibleMenuItems() {
    console.log("📋 Getting visible menu items...");

    const sidebarExists = await this.waitForSidebar();
    if (!sidebarExists) {
      console.log("No sidebar found, returning empty menu items");
      return [];
    }

    const menuItems = [];

    const navigationIds = {
      // Admin routes
      "Dashboard": "nav-dashboard",
      "Facilities": "nav-facilities",
      "Users": "nav-users",
      "Hume Configs": "nav-hume-configs",
      "Profile": "nav-profile",
      "Caller": "nav-caller",
      
      // Manager routes  
      "Members": "nav-members",
      "Call History": "nav-call-history",

      // Member routes
      "Talk To Me": "nav-voice-chat",
      
      // Public routes
      "About": "nav-about",
    };

    for (const [itemName, id] of Object.entries(navigationIds)) {
      try {
        if (await this.isVisible(`#${id}`)) {
          console.log(`✅ Found menu item: ${itemName}`);
          menuItems.push(itemName);
        }
      } catch (error) {
        continue;
      }
    }

    console.log(`📋 Found ${menuItems.length} visible menu items: ${menuItems.join(", ")}`);
    return menuItems;
  }

  async clickMenuItem(itemName) {
    console.log(`🖱️ Clicking menu item: ${itemName}`);

    const navigationIds = {
      "Dashboard": "nav-dashboard",
      "Caller": "nav-caller",
      "Hume Configs": "nav-hume-configs",
      "Users": "nav-users",
      "Facilities": "nav-facilities",
      "Profile": "nav-profile",

      // Manager routes  
      "Members": "nav-members",
      "Call History": "nav-call-history",

      // Member routes
      "Talk To Me": "nav-voice-chat",
      
      // Public routes
      "About": "nav-about",
    };

    const elementId = navigationIds[itemName];

    if (!elementId) {
      throw new Error(`Unknown menu item: ${itemName}. Available items: ${Object.keys(navigationIds).join(", ")}`);
    }

    try {
      await this.clickElement(`#${elementId}`);
      await this.waitForNavigation();
      console.log(`✅ Successfully navigated to: ${itemName}`);
    } catch (error) {
      console.log(`❌ Failed to click menu item ${itemName}: ${error.message}`);
      await this.takeScreenshot(`menu-click-failed-${itemName.replace(/\s+/g, "-")}`);
      throw error;
    }
  }

  async navigateAllMenuItems() {
    const menuItems = await this.getVisibleMenuItems();
    const results = [];

    for (const item of menuItems) {
      try {
        console.log(`🚀 Navigating to: ${item}`);

        const beforeUrl = this.getCurrentUrl();
        await this.clickMenuItem(item);
        const afterUrl = this.getCurrentUrl();

        const navigationSuccess = beforeUrl !== afterUrl;

        results.push({
          item,
          success: navigationSuccess,
          url: afterUrl,
          error: null,
        });

        console.log(`${item}: ${navigationSuccess ? "✅ SUCCESS" : "⚠️ NO CHANGE"} - ${afterUrl}`);

        // Wait a moment between navigations
        await this.page.waitForTimeout(1000);

      } catch (error) {
        results.push({
          item,
          success: false,
          url: this.getCurrentUrl(),
          error: error.message,
        });
        console.log(`❌ ${item}: FAILED - ${error.message}`);
      }
    }

    return results;
  }
}
