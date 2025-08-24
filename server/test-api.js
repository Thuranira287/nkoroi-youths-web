#!/usr/bin/env node

// Simple API testing script for St. Bhakita Catholic Youths API
const http = require("http");

const API_BASE = "http://localhost:3000";

// Test results tracking
let tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        try {
          const parsedBody = responseBody ? JSON.parse(responseBody) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test function
async function runTest(name, testFn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    const result = await testFn();

    if (result.success) {
      console.log(`✅ PASS: ${name}`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: ${name} - ${result.message}`);
      failedTests++;
    }

    tests.push({ name, ...result });
  } catch (error) {
    console.log(`❌ ERROR: ${name} - ${error.message}`);
    failedTests++;
    tests.push({ name, success: false, message: error.message });
  }
}

// Global variables for storing auth tokens
let adminToken = "";
let userToken = "";

// Test functions
async function testPing() {
  const response = await makeRequest("GET", "/api/ping");
  return {
    success: response.statusCode === 200 && response.body.message,
    message:
      response.statusCode === 200
        ? "API is responding"
        : `Expected 200, got ${response.statusCode}`,
  };
}

async function testAdminLogin() {
  const response = await makeRequest("POST", "/api/auth/login", {
    email: "admin@stbhakita.org",
    password: "admin123",
  });

  if (response.statusCode === 200 && response.body.token) {
    adminToken = response.body.token;
    return {
      success: true,
      message: "Admin login successful",
      data: { role: response.body.user?.role },
    };
  }

  return {
    success: false,
    message: `Login failed: ${response.statusCode} - ${JSON.stringify(response.body)}`,
  };
}

async function testUserLogin() {
  const response = await makeRequest("POST", "/api/auth/login", {
    email: "user@stbhakita.org",
    password: "user123",
  });

  if (response.statusCode === 200 && response.body.token) {
    userToken = response.body.token;
    return {
      success: true,
      message: "User login successful",
      data: { role: response.body.user?.role },
    };
  }

  return {
    success: false,
    message: `User login failed: ${response.statusCode} - ${JSON.stringify(response.body)}`,
  };
}

async function testGetUser() {
  const response = await makeRequest("GET", "/api/auth/user", null, {
    Authorization: `Bearer ${adminToken}`,
  });

  return {
    success:
      response.statusCode === 200 &&
      response.body.data?.email === "admin@stbhakita.org",
    message:
      response.statusCode === 200
        ? "User data retrieved successfully"
        : `Failed to get user: ${response.statusCode}`,
  };
}

async function testDailyQuote() {
  const response = await makeRequest("GET", "/api/daily-quote");
  return {
    success: response.statusCode === 200 && response.body.verse,
    message:
      response.statusCode === 200
        ? "Daily quote retrieved"
        : `Failed: ${response.statusCode}`,
  };
}

async function testAnnouncements() {
  const response = await makeRequest("GET", "/api/announcements");
  return {
    success: response.statusCode === 200 && Array.isArray(response.body),
    message:
      response.statusCode === 200
        ? `Retrieved ${response.body.length} announcements`
        : `Failed: ${response.statusCode}`,
  };
}

async function testCreateAnnouncement() {
  const newAnnouncement = {
    title: "Test Announcement",
    description: "This is a test announcement created by API test",
    date: "2024-12-25",
    time: "10:00 AM",
    venue: "Test Venue",
  };

  const response = await makeRequest(
    "POST",
    "/api/announcements",
    newAnnouncement,
    {
      Authorization: `Bearer ${adminToken}`,
    },
  );

  return {
    success: response.statusCode === 201 && response.body.id,
    message:
      response.statusCode === 201
        ? "Announcement created successfully"
        : `Failed: ${response.statusCode} - ${JSON.stringify(response.body)}`,
  };
}

async function testTripAlbums() {
  const response = await makeRequest("GET", "/api/trips");
  return {
    success: response.statusCode === 200 && Array.isArray(response.body),
    message:
      response.statusCode === 200
        ? `Retrieved ${response.body.length} trip albums`
        : `Failed: ${response.statusCode}`,
  };
}

async function testSundayReadings() {
  const response = await makeRequest("GET", "/api/readings");
  return {
    success: response.statusCode === 200 && Array.isArray(response.body),
    message:
      response.statusCode === 200
        ? `Retrieved ${response.body.length} readings`
        : `Failed: ${response.statusCode}`,
  };
}

async function testCurrentReading() {
  const response = await makeRequest("GET", "/api/readings/current");
  return {
    success: response.statusCode === 200,
    message:
      response.statusCode === 200
        ? "Current reading retrieved"
        : `Failed: ${response.statusCode}`,
  };
}

async function testRosaryMysteries() {
  const response = await makeRequest("GET", "/api/rosary");
  return {
    success:
      response.statusCode === 200 &&
      response.body.joyful &&
      response.body.sorrowful,
    message:
      response.statusCode === 200
        ? "Rosary mysteries retrieved"
        : `Failed: ${response.statusCode}`,
  };
}

async function testBibleBooks() {
  const response = await makeRequest("GET", "/api/bible/books");
  return {
    success: response.statusCode === 200 && Array.isArray(response.body),
    message:
      response.statusCode === 200
        ? `Retrieved ${response.body.length} bible books`
        : `Failed: ${response.statusCode}`,
  };
}

async function testBibleChapter() {
  const response = await makeRequest("GET", "/api/bible/books/1/chapters/1");
  return {
    success: response.statusCode === 200 && Array.isArray(response.body),
    message:
      response.statusCode === 200
        ? "Bible chapter retrieved"
        : `Failed: ${response.statusCode}`,
  };
}

async function testRandomVerse() {
  const response = await makeRequest("GET", "/api/bible/random");
  return {
    success: response.statusCode === 200 && response.body.text,
    message:
      response.statusCode === 200
        ? "Random verse retrieved"
        : `Failed: ${response.statusCode}`,
  };
}

async function testVerseOfTheDay() {
  const response = await makeRequest("GET", "/api/bible/verse-of-day");
  return {
    success: response.statusCode === 200 && response.body.text,
    message:
      response.statusCode === 200
        ? "Verse of the day retrieved"
        : `Failed: ${response.statusCode}`,
  };
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting API Tests for St. Bhakita Catholic Youths\n");

  // Basic API tests
  await runTest("API Ping", testPing);

  // Authentication tests
  await runTest("Admin Login", testAdminLogin);
  await runTest("User Login", testUserLogin);
  await runTest("Get User Data", testGetUser);

  // Content API tests
  await runTest("Daily Quote", testDailyQuote);
  await runTest("Get Announcements", testAnnouncements);
  await runTest("Create Announcement (Admin)", testCreateAnnouncement);
  await runTest("Get Trip Albums", testTripAlbums);
  await runTest("Get Sunday Readings", testSundayReadings);
  await runTest("Get Current Reading", testCurrentReading);
  await runTest("Get Rosary Mysteries", testRosaryMysteries);
  await runTest("Get Bible Books", testBibleBooks);
  await runTest("Get Bible Chapter", testBibleChapter);
  await runTest("Get Random Verse", testRandomVerse);
  await runTest("Get Verse of the Day", testVerseOfTheDay);

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📝 Total: ${tests.length}`);

  if (failedTests === 0) {
    console.log("\n🎉 All tests passed! API is working correctly.");
    process.exit(0);
  } else {
    console.log(
      `\n⚠️  ${failedTests} test(s) failed. Check the output above for details.`,
    );
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error("Test runner error:", error);
    process.exit(1);
  });
}

module.exports = { runAllTests, makeRequest };
