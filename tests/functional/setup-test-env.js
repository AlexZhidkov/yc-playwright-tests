import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  console.log("envPath", envPath);
  const envTemplate = `# Functional Test Environment Configuration
# Base URL for testing
BASE_URL=https://yappercare.web.app

# Test User Credentials for different roles
# Admin user
ADMIN_EMAIL=team+test+admin@yapper.care
ADMIN_PASSWORD=your-admin-password

# Manager user  
MANAGER_EMAIL=team+test+manager@yapper.care
MANAGER_PASSWORD=your-manager-password

# User role
USER_EMAIL=team+test+user@yapper.care
USER_PASSWORD=your-user-password

# Member user
MEMBER_EMAIL=team+test+member@yapper.care
MEMBER_PASSWORD=your-member-password

# Legacy test user (for backward compatibility)
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password

# Test Configuration
# Set to true to run tests with visible browser
HEADED=false

# Set to true to slow down actions for debugging
SLOW_MO=false
`;

  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env file already exists");
    console.log("   Please update it manually with your test credentials");
    return;
  }

  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log("✅ Created .env file");
    console.log("   Please edit it and add your test credentials");
  } catch (error) {
    console.error("❌ Failed to create .env file:", error.message);
  }
}

function createTestResultsDir() {
  const testResultsPath = path.join(process.cwd(), "test-results");
  const screenshotsPath = path.join(testResultsPath, "screenshots");

  try {
    if (!fs.existsSync(testResultsPath)) {
      fs.mkdirSync(testResultsPath, { recursive: true });
    }
    if (!fs.existsSync(screenshotsPath)) {
      fs.mkdirSync(screenshotsPath, { recursive: true });
    }
    console.log("✅ Created test-results directories");
  } catch (error) {
    console.error(
      "❌ Failed to create test-results directories:",
      error.message
    );
  }
}

function main() {
  console.log("🔧 Setting up functional test environment...\n");

  createEnvFile();
  createTestResultsDir();
}

main();
