const levels    = ["error", "warn", "info", "debug", "trace", "fatal"];
const resources = ["server-1234", "server-5678", "server-9999", "server-0001", "server-0002"];
const parents   = ["server-0987", "server-0001", "server-0002", "server-0003"];
const commits   = ["5e5342f", "abc1234", "dead000", "beef123", "cafe456"];
const messages  = [
  "Failed to connect to DB",
  "Connection timeout on retry",
  "High memory usage detected",
  "Server started successfully",
  "Cache miss for key user:",
  "Out of memory — process killed",
  "Request rate limit exceeded",
  "Disk usage above 90%",
  "Authentication failed for user",
  "SSL certificate expiring soon",
  "Database query took too long",
  "Service health check failed",
  "Deployment completed successfully",
  "Rollback triggered due to error",
  "New connection established",
  "Graceful shutdown initiated",
  "Config reloaded successfully",
  "Unexpected null pointer exception",
  "Queue depth exceeded threshold",
  "Backup completed successfully",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
  const start = new Date("2023-09-01T00:00:00Z").getTime();
  const end   = new Date("2023-09-30T23:59:59Z").getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function generateLog() {
  return {
    level:      randomItem(levels),
    message:    randomItem(messages) + ` ${Math.floor(Math.random() * 9999)}`,
    resourceId: randomItem(resources),
    timestamp:  randomDate(),
    traceId:    `trace-${Math.random().toString(36).slice(2, 10)}`,
    spanId:     `span-${Math.random().toString(36).slice(2, 8)}`,
    commit:     randomItem(commits),
    metadata:   { parentResourceId: randomItem(parents) },
  };
}

async function getToken() {
  const res = await fetch("http://localhost:3000/auth/login", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username: "ajit", password: "12345678" }),
  });
  const data = await res.json();
  if (!data.token) {
    console.error("Login failed:", data.error);
    process.exit(1);
  }
  return data.token;
}

async function seed(total = 1000, batchSize = 100) {
  console.log("Logging in...");
  const token = await getToken();
  console.log("Login successful!");
  console.log(`Seeding ${total} logs in batches of ${batchSize}...`);

  for (let i = 0; i < total; i += batchSize) {
    const batch = Array.from({ length: batchSize }, generateLog);

    const res = await fetch("http://localhost:3000/logs/bulk", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(batch),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error:", data.error);
      return;
    }

    console.log(`Batch ${i / batchSize + 1}: ${data.count} logs queued`);
  }

  console.log("Done! Check http://localhost:5173");
}

seed(1000, 100);