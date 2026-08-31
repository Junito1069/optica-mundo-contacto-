// check-railway-api.js
// Node 18+
// Ejecución:
// ADMIN_EMAIL=admin@gmail.com ADMIN_PASSWORD=tu_password node check-railway-api.js

const BASE_URL = "https://optica-mundo-contacto-production.up.railway.app";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tu_password";

const cookieJar = new Map();

function setCookieHeader(rawCookies) {
  if (!rawCookies) return;
  const parts = rawCookies.split(";");
  const [nameValue] = parts;
  const idx = nameValue.indexOf("=");
  if (idx === -1) return;
  const name = nameValue.slice(0, idx).trim();
  const value = nameValue.slice(idx + 1).trim();
  cookieJar.set(name, value);
}

function getCookieHeader() {
  const entries = [...cookieJar.entries()];
  if (!entries.length) return "";
  return entries.map(([k, v]) => `${k}=${v}`).join("; ");
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const cookieHeader = getCookieHeader();
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const rawSetCookie = response.headers.get("set-cookie");
  if (rawSetCookie) {
    setCookieHeader(rawSetCookie);
  }

  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  return {
    ok: response.ok,
    status: response.status,
    headers: response.headers,
    data,
  };
}

async function testHealth() {
  console.log("\n=== 1) Health check ===");
  const res = await request("/api/health");
  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.data, null, 2));
}

async function loginAdmin() {
  console.log("\n=== 2) Admin login ===");
  const res = await request("/api/admin/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.data, null, 2));
  console.log("Cookies in jar:", Object.fromEntries(cookieJar));

  return res;
}

async function registerCustomer() {
  console.log("\n=== 3) Customer register ===");
  const uniqueEmail = `qa.user.${Date.now()}@example.com`;
  const res = await request("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "QA User",
      email: uniqueEmail,
      password: "Password123!",
      phone: "8090000000",
      address: "Calle Test 123",
      city: "Santo Domingo",
      sector: "Centro",
      reference: "Frente al parque",
    }),
  });

  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.data, null, 2));
  return { res, email: uniqueEmail, password: "Password123!" };
}

async function loginCustomer(email, password) {
  console.log("\n=== 4) Customer login ===");
  const res = await request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.data, null, 2));
  console.log("Cookies in jar:", Object.fromEntries(cookieJar));
  return res;
}

async function testProtectedAdminRoute() {
  console.log("\n=== 5) Protected admin route ===");
  const res = await request("/api/admin/users");
  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.data, null, 2));
}

async function testBadLogin() {
  console.log("\n=== 6) Invalid admin login (error handling) ===");
  const res = await request("/api/admin/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "bad@example.com",
      password: "wrong-password",
    }),
  });

  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.data, null, 2));
}

async function main() {
  try {
    await testHealth();

    const adminLogin = await loginAdmin();
    if (!adminLogin.ok) {
      console.log("Admin login failed. Check ADMIN_EMAIL and ADMIN_PASSWORD.");
      return;
    }

    await testProtectedAdminRoute();

    const customer = await registerCustomer();
    if (customer.res.ok) {
      await loginCustomer(customer.email, customer.password);
    }

    await testBadLogin();
  } catch (error) {
    console.error("ERROR GENERAL:");
    console.error(error);
  }
}

main();
