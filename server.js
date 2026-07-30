/**
 * Minimal Node.js HTTP Server for AWS CI/CD Lab
 * Uses strictly native Node.js modules (http, os) - zero npm dependencies.
 */

const http = require('http');
const os = require('os');

// Configuration & Environment Variables
const PORT = process.env.PORT || 80;
const COMMIT_SHA = process.env.COMMIT_SHA || 'unknown';

/**
 * Generates the self-contained HTML landing page with dynamic runtime deployment info.
 */
function renderLandingPage() {
  const hostname = os.hostname();
  const serverTime = new Date().toUTCString();
  const displaySha = COMMIT_SHA !== 'unknown' ? COMMIT_SHA : 'unknown';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CI/CD Lab Deployment | AWS</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(23, 32, 54, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.15);
      --accent-green: #34d399;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(ellipse at 50% -20%, rgba(56, 189, 248, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
    }

    .container {
      width: 100%;
      max-width: 720px;
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Hero Section */
    .hero {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .badge-aws {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.9rem;
      background: var(--accent-glow);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 9999px;
      color: var(--accent);
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--accent-green);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent-green);
      animation: pulse 2s infinite;
    }

    .hero h1 {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }

    .hero p {
      color: var(--text-muted);
      font-size: 1.0625rem;
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Deployment Info Panel */
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .panel-header {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-main);
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.25rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      border-color: rgba(56, 189, 248, 0.2);
    }

    .card.full-width {
      grid-column: 1 / -1;
    }

    .label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-main);
      word-break: break-all;
    }

    .value.mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.9rem;
      color: var(--accent);
      background: rgba(56, 189, 248, 0.08);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(56, 189, 248, 0.15);
      display: inline-block;
      width: 100%;
    }

    .footer {
      margin-top: 2rem;
      text-align: center;
      color: #64748b;
      font-size: 0.8125rem;
    }

    /* CSS Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.15); }
      100% { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 640px) {
      .hero h1 { font-size: 1.875rem; }
      .panel { padding: 1.25rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="hero">
      <div class="badge-aws">
        <span class="status-dot"></span>
        Deployed via AWS CodePipeline
      </div>
      <h1>CI/CD Pipeline Verification</h1>
      <p>Automated container deployment on AWS with Blue/Green deployment strategy.</p>
    </header>

    <main class="panel">
      <div class="panel-header">
        Deployment Traceability & Telemetry
      </div>

      <div class="grid">
        <div class="card full-width">
          <div class="label">Commit SHA</div>
          <div class="value mono">${displaySha}</div>
        </div>

        <div class="card">
          <div class="label">Served By (Container ID)</div>
          <div class="value mono" style="color: #cbd5e1; background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1);">${hostname}</div>
        </div>

        <div class="card">
          <div class="label">Server Time</div>
          <div class="value">${serverTime}</div>
        </div>
      </div>
    </main>

    <footer class="footer">
      Node.js v20 (Alpine) • AWS EC2 & CodeDeploy
    </footer>
  </div>
</body>
</html>`;
}

// Request Router & HTTP Server Setup
const server = http.createServer((req, res) => {
  // Lightweight healthcheck endpoint for ALB & deploy scripts
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('OK');
  }

  // Primary HTML landing page
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderLandingPage());
});

// Start listening on configured port
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Commit SHA: ${COMMIT_SHA}`);
  console.log(`Hostname: ${os.hostname()}`);
});
