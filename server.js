const http = require('http');

const PORT = process.env.PORT || 80;
const COMMIT_SHA = process.env.COMMIT_SHA || 'development';

const html = `<!DOCTYPE html> 
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AWS CI/CD Lab</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --border: #334155;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 30px var(--accent-glow);
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent);
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.875rem;
      margin: 0 0 0.5rem 0;
    }
    p {
      color: #94a3b8;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .sha-box {
      background: #090d16;
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 1.1rem;
      color: var(--accent);
      display: inline-block;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">AWS CI/CD Pipeline</div>
    <h1>Deployment Successful!</h1>
    <p>This web application was built by CodeBuild and deployed to EC2 via CodeDeploy.</p>
    <div>
      <small style="color: #64748b; display: block; margin-bottom: 0.5rem;">Git Commit SHA</small>
      <div class="sha-box">${COMMIT_SHA}</div>
    </div>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
