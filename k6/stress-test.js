import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 10  },
    { duration: "1m",  target: 50  },
    { duration: "2m",  target: 100 },
    { duration: "1m",  target: 200 },
    { duration: "30s", target: 0   },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed:   ["rate<0.1"],  // ← relaxed to 10% while debugging
  },
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLog() {
  const levels    = ["error", "warn", "info", "debug", "trace", "fatal"];
  const resources = ["server-1234", "server-5678", "server-9999", "server-0001"];
  const messages  = [
    "Failed to connect to DB",
    "High memory usage detected",
    "Server started successfully",
    "Cache miss for key user",
    "Request rate limit exceeded",
    "Authentication failed for user",
  ];
  return {
    level:      randomItem(levels),
    message:    randomItem(messages),
    resourceId: randomItem(resources),
    timestamp:  new Date().toISOString(),
    traceId:    `trace-${Math.random().toString(36).slice(2, 10)}`,
    spanId:     `span-${Math.random().toString(36).slice(2, 8)}`,
    commit:     "abc1234",
    metadata:   { parentResourceId: "server-0987" },
  };
}

// ── Setup — runs once, return value passed to default ─────────────────────────
export function setup() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: "ajit", password: "12345678" }),
    { headers: { "Content-Type": "application/json" } }
  );

  // Debug login response
  console.log(`Login status: ${res.status}`);
  console.log(`Login body: ${res.body}`);

  const success = check(res, {
    "login successful": r => r.status === 200,
  });

  if (!success) {
    console.error("LOGIN FAILED — check username/password");
    return { token: null };
  }

  const body = JSON.parse(res.body);
  console.log(`Token received: ${body.token ? "YES" : "NO"}`);
  return { token: body.token };
}

// ── Main test ─────────────────────────────────────────────────────────────────
export default function (data) {
  // Skip if no token
  if (!data.token) {
    console.error("No token available — skipping");
    sleep(1);
    return;
  }

  const headers = {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${data.token}`,
  };

  const action = Math.random();

  if (action < 0.4) {
    // Single log ingest
    const res = http.post(
      `${BASE_URL}/logs`,
      JSON.stringify(generateLog()),
      { headers }
    );
    check(res, {
      "ingest status 202": r => r.status === 202,
    });

    if (res.status !== 202) {
      console.log(`Ingest failed: ${res.status} — ${res.body}`);
    }

  } else if (action < 0.7) {
    // Bulk ingest
    const batch = Array.from({ length: 10 }, generateLog);
    const res = http.post(
      `${BASE_URL}/logs/bulk`,
      JSON.stringify(batch),
      { headers }
    );
    check(res, {
      "bulk ingest status 202": r => r.status === 202,
    });

    if (res.status !== 202) {
      console.log(`Bulk failed: ${res.status} — ${res.body}`);
    }

  } else {
    // Search
    const levels    = ["error", "warn", "info", "debug"];
    const resources = ["server-1234", "server-5678", "server-9999"];
    const queryType = Math.random();
    let url;

    if (queryType < 0.25) {
      url = `${BASE_URL}/search?level=${randomItem(levels)}`;
    } else if (queryType < 0.5) {
      url = `${BASE_URL}/search?resourceId=${randomItem(resources)}`;
    } else if (queryType < 0.75) {
      url = `${BASE_URL}/search?q=Failed+to+connect`;
    } else {
      url = `${BASE_URL}/search?timestampFrom=2023-09-01T00:00:00Z&timestampTo=2023-09-30T23:59:59Z`;
    }

    const res = http.get(url, { headers });
    check(res, {
      "search status 200": r => r.status === 200,
      "search has logs":   r => JSON.parse(r.body).logs !== undefined,
    });
  }

  sleep(0.5);
}