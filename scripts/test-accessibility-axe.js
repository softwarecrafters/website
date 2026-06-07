const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const { existsSync } = require('node:fs');

const HOST = '127.0.0.1';
const PAGE_PATHS = ['/', '/conferences.html'];
const SERVER_STOP_TIMEOUT_MS = 3000;
const REQUIRED_DATA_FILES = ['communities.json', 'conferences.json'];

async function getFreePort(host) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();

    server.on('error', reject);
    server.listen(0, host, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Could not determine free TCP port.')));
        return;
      }

      const { port } = address;
      server.close(error => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

function isServerReady(url) {
  return new Promise(resolve => {
    const req = http.get(url, response => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isServerReady(url)) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for local server: ${url}`);
}

function formatViolations(pagePath, violations) {
  const lines = [`${pagePath}: ${violations.length} accessibility violation(s)`];

  for (const violation of violations) {
    const impact = violation.impact || 'unknown';
    lines.push(`  - [${impact}] ${violation.id}: ${violation.help}`);
    lines.push(`    ${violation.helpUrl}`);

    for (const node of violation.nodes.slice(0, 3)) {
      lines.push(`    target: ${node.target.join(' | ')}`);
    }
  }

  return lines.join('\n');
}

function ensureRuntimeDataFiles() {
  const projectRoot = path.resolve(__dirname, '..');
  const missingDataFiles = REQUIRED_DATA_FILES.filter(fileName => {
    return !existsSync(path.join(projectRoot, fileName));
  });

  if (missingDataFiles.length === 0) {
    return;
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const buildResult = spawnSync(npmCommand, ['run', 'build:data'], {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit',
  });

  if (buildResult.status !== 0) {
    throw new Error('Failed to generate runtime data files required for accessibility tests.');
  }
}

async function runAxeScans(baseUrl) {
  const playwright = require('playwright');
  const AxeBuilder = require('@axe-core/playwright').default;
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const pagePath of PAGE_PATHS) {
    await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.mapboxgl-ctrl')
      .exclude('.mapboxgl-control-container')
      .analyze();

    results.push({ pagePath, violations: axeResults.violations });
  }

  await context.close();
  await browser.close();
  return results;
}

async function main() {
  ensureRuntimeDataFiles();

  const port = await getFreePort(HOST);
  const baseUrl = `http://${HOST}:${port}`;
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const server = spawn(
    npxCommand,
    ['vite', '--host', HOST, '--port', String(port), '--strictPort'],
    {
      stdio: ['ignore', 'ignore', 'pipe'],
      env: process.env,
      detached: process.platform !== 'win32',
    }
  );

  const waitForExit = timeoutMs =>
    new Promise(resolve => {
      let settled = false;
      const timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      }, timeoutMs);

      server.once('exit', () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          resolve(true);
        }
      });
    });

  const stopServer = async () => {
    if (server.killed) {
      return;
    }

    if (process.platform === 'win32') {
      server.kill('SIGTERM');
      return;
    }

    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill('SIGTERM');
    }

    const exitedAfterTerm = await waitForExit(SERVER_STOP_TIMEOUT_MS);
    if (!exitedAfterTerm) {
      try {
        process.kill(-server.pid, 'SIGKILL');
      } catch {
        server.kill('SIGKILL');
      }
      await waitForExit(500);
    }
  };

  let stderrBuffer = '';
  server.stderr.on('data', chunk => {
    stderrBuffer += chunk.toString();
  });

  try {
    await waitForServer(baseUrl, 20000);

    const results = await runAxeScans(baseUrl);
    const failures = results.filter(result => result.violations.length > 0);

    if (failures.length > 0) {
      console.error('Axe accessibility checks failed:');
      for (const failure of failures) {
        console.error(formatViolations(failure.pagePath, failure.violations));
      }
      process.exitCode = 1;
      return;
    }

    console.log('Axe accessibility checks passed.');
  } finally {
    await stopServer();
    if (stderrBuffer.trim().length > 0) {
      const hasOnlyViteNoise = /\[vite\]/i.test(stderrBuffer);
      if (!hasOnlyViteNoise) {
        console.error(stderrBuffer.trim());
      }
    }
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
