import dotenv from "dotenv";
const envFile = process.env.ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: envFile, override: true });

console.log("Loaded env file:", envFile);
console.log("Loaded environment variables: ", {
  BASE_URL: process.env.BASE_URL,
  TEST_EMAIL: process.env.TEST_EMAIL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  MANAGER_EMAIL: process.env.MANAGER_EMAIL,
  USER_EMAIL: process.env.USER_EMAIL,
  MEMBER_EMAIL: process.env.MEMBER_EMAIL,
});

export const testConfig = {
  baseUrl: process.env.BASE_URL,

  testUser: {
    email: process.env.TEST_EMAIL,
    password: process.env.TEST_PASSWORD,
  },

  adminUser: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },

  managerUser: {
    email: process.env.MANAGER_EMAIL,
    password: process.env.MANAGER_PASSWORD,
  },

  userUser: {
    email: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
  },

  pccUser: {
    email: process.env.PCC_EMAIL,
    password: process.env.PCC_PASSWORD,
  },

  memberUser: {
    email: process.env.MEMBER_EMAIL,
    password: process.env.MEMBER_PASSWORD,
  },

  headed: process.env.HEADED === "true",
  slowMo: process.env.SLOW_MO === "true" ? 1000 : 0,

  timeouts: {
    navigation: 60000,
    element: 10000,
    assertion: 5000,
  },

  testData: {
    aboutMePrefix: "Functional Test Update -",
  },

  // Role-based route expectations - updated to match actual working routing logic
  roleRoutes: {
    admin: [
      "Dashboard",
      "Members", 
      "Caller",
      "Talk To Me",
      "Hume Configs",
      "Users",
      "Facilities",
      "Call History",
      "Profile"
    ],
    manager: [
      "Members",
      "Call History", 
      "Talk To Me",
      "Profile"
    ],
    member: [
      "Talk To Me",
      "Members",
      "Profile"
    ],
    user: [
      "About",
      "Talk To Me"
    ]
  }
};

export default testConfig;
