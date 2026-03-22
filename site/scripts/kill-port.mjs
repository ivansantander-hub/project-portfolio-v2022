import { execSync } from 'child_process';
import { platform } from 'os';

const PORT = 2323;

try {
  if (platform() === 'win32') {
    const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    const lines = result.trim().split('\n').filter(l => l.includes('LISTENING'));
    for (const line of lines) {
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== '0') {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[kill-port] Freed port ${PORT} (PID ${pid})`);
      }
    }
  } else {
    execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, { shell: true, stdio: 'ignore' });
    console.log(`[kill-port] Freed port ${PORT}`);
  }
} catch {
  // Port was already free, nothing to do
}
