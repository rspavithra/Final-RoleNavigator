const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORTS = [5000, 5001, 5002, 5003, 5004, 5005];

// ── Kill any process currently using our ports ───────────
function killPortsSync(ports) {
  console.log('🔪 Freeing ports:', ports.join(', '), '...');
  for (const port of ports) {
    try {
      // Windows: find PID using netstat, then kill it
      const result = execSync(
        `netstat -ano | findstr :${port}`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      const lines = result.split('\n').filter(l => l.includes('LISTENING'));
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`  ✅ Freed port ${port} (killed PID ${pid})`);
          } catch (_) { /* already dead */ }
        }
      }
    } catch (_) {
      // port not in use — that's fine
    }
  }
  console.log('');
}

const services = [
  {
    name: 'Landing Page',
    port: 5000,
    cwd: path.join(__dirname, 'HomePage', 'backend'),
    command: 'node',
    args: ['server.js']
  },
  {
    name: 'Resume Analyzer',
    port: 5001,
    cwd: path.join(__dirname, 'RoleNavigator-Analyser'),
    command: 'npm',
    args: ['run', 'dev']
  },
  {
    name: 'Interview Frontend',
    port: 5002,
    cwd: path.join(__dirname, 'InterviewQuestionGenerator', 'Interview-question-new', 'frontend'),
    command: 'npm',
    args: ['run', 'dev']
  },
  {
    name: 'Interview Backend',
    port: 5003,
    cwd: path.join(__dirname, 'InterviewQuestionGenerator', 'Interview-question-new', 'backend'),
    command: 'python',
    args: ['app.py'],
    getCommand: (cwd) => {
      const winPath = path.join(cwd, 'venv', 'Scripts', 'python.exe');
      const unixPath = path.join(cwd, 'venv', 'bin', 'python');
      if (fs.existsSync(winPath)) return `"${winPath}"`;
      if (fs.existsSync(unixPath)) return `"${unixPath}"`;
      return 'python';
    }
  },
  {
    name: 'Resume Builder Frontend',
    port: 5004,
    cwd: path.join(__dirname, 'resume-builder', 'frontend'),
    command: 'npm',
    args: ['run', 'dev']
  },
  {
    name: 'Resume Builder Backend',
    port: 5005,
    cwd: path.join(__dirname, 'resume-builder', 'backend'),
    command: 'python',
    args: ['app.py'],
    getCommand: (cwd) => {
      const winPath = path.join(cwd, 'venv', 'Scripts', 'python.exe');
      const unixPath = path.join(cwd, 'venv', 'bin', 'python');
      if (fs.existsSync(winPath)) return `"${winPath}"`;
      if (fs.existsSync(unixPath)) return `"${unixPath}"`;
      return 'python';
    }
  }
];

// ── Validate that service directories exist ──────────────
function checkDirectories() {
  let allOk = true;
  for (const svc of services) {
    if (!fs.existsSync(svc.cwd)) {
      console.warn(`⚠️  [${svc.name}] Directory NOT FOUND: ${svc.cwd}`);
      allOk = false;
    }
  }
  return allOk;
}

// ── Main ─────────────────────────────────────────────────
console.log('🚀 Starting RoleNavigator Ecosystem...\n');

killPortsSync(PORTS);
checkDirectories();
console.log('');

const colors = ['\x1b[36m', '\x1b[32m', '\x1b[33m', '\x1b[35m', '\x1b[34m', '\x1b[31m'];
const RESET = '\x1b[0m';

services.forEach((service, i) => {
  const color = colors[i % colors.length];
  const prefix = `${color}[${service.name} :${service.port}]${RESET}`;

  if (!fs.existsSync(service.cwd)) {
    console.warn(`${prefix} ⚠️  Skipping — directory not found.`);
    return;
  }

  const cmd = service.getCommand ? service.getCommand(service.cwd) : service.command;

  const proc = spawn(cmd, service.args, {
    cwd: service.cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  proc.stdout.on('data', (data) => {
    data.toString().split('\n').filter(Boolean).forEach(line => {
      console.log(`${prefix} ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    data.toString().split('\n').filter(Boolean).forEach(line => {
      console.error(`${prefix} ⚠️  ${line}`);
    });
  });

  proc.on('error', (err) => {
    console.error(`${prefix} ❌ Failed to start: ${err.message}`);
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${prefix} ❌ Exited with code ${code}`);
    }
  });

  console.log(`${prefix} ▶ Starting...`);
});

console.log('\n💡 All services launching. Main app → http://localhost:5000\n');
console.log('   Resume Analyzer   → http://localhost:5001');
console.log('   Interview UI      → http://localhost:5002');
console.log('   Interview API     → http://localhost:5003');
console.log('   Resume Builder UI → http://localhost:5004');
console.log('   Resume Builder API→ http://localhost:5005\n');
